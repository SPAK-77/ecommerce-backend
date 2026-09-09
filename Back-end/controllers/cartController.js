const db = require('../config/db');

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const [items] = await db.execute(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image, p.stock, c.name as category
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return res.json({ success: true, items, total });
  } catch (err) {
    console.error('Get cart error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/cart/add
const addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const numQty = Math.max(1, parseInt(quantity, 10) || 1);
  if (!product_id) return res.status(400).json({ success: false, message: 'Product ID required.' });

  try {
    // Check if product exists & check stock
    const [product] = await db.execute('SELECT id, name, stock FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) return res.status(404).json({ success: false, message: 'Product not found.' });

    const availableStock = product[0].stock;
    if (availableStock <= 0) {
      return res.status(400).json({ success: false, message: `"${product[0].name}" is currently out of stock.` });
    }

    // Check current quantity already in user's cart
    const [existingCart] = await db.execute(
      'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    const currentQty = existingCart.length > 0 ? existingCart[0].quantity : 0;
    const newTotalQty = currentQty + numQty;

    if (newTotalQty > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${numQty} item(s). Total in cart (${newTotalQty}) would exceed available stock of ${availableStock}.`,
      });
    }

    // Upsert
    await db.execute(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, numQty]
    );

    return res.json({ success: true, message: 'Item added to cart.' });
  } catch (err) {
    console.error('Add to cart error:', err);
    return res.status(500).json({ success: false, message: 'Server error while adding to cart.' });
  }
};

// PUT /api/cart/update
const updateCart = async (req, res) => {
  const { cart_item_id, quantity } = req.body;
  const numQty = parseInt(quantity, 10);
  if (!cart_item_id || isNaN(numQty) || numQty < 1) {
    return res.status(400).json({ success: false, message: 'Invalid cart item or quantity.' });
  }

  try {
    // Fetch cart item & product stock
    const [rows] = await db.execute(
      `SELECT ci.id, p.stock, p.name FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?`,
      [cart_item_id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    if (numQty > rows[0].stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${numQty}) exceeds available stock of ${rows[0].stock} for "${rows[0].name}".`,
      });
    }

    await db.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [numQty, cart_item_id, req.user.id]
    );
    return res.json({ success: true, message: 'Cart updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error while updating cart.' });
  }
};

// DELETE /api/cart/remove/:id
const removeFromCart = async (req, res) => {
  try {
    await db.execute('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.json({ success: true, message: 'Item removed from cart.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/cart/clear
const clearCart = async (req, res) => {
  try {
    await db.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    return res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart, clearCart };
