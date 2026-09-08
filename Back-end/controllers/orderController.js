const db = require('../config/db');

// POST /api/orders
const placeOrder = async (req, res) => {
  const { address, payment_method = 'cod', notes } = req.body;
  const userId = req.user.id;

  try {
    // Get cart items
    const [cartItems] = await db.execute(
      `SELECT ci.quantity, p.id as product_id, p.name, p.price, p.image, p.stock
       FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // Check stock
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for "${item.name}".` });
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.18;
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping;

    const addressSnapshot = JSON.stringify(address);

    // Create order
    const [orderResult] = await db.execute(
      'INSERT INTO orders (user_id, total, subtotal, tax, shipping, payment_method, address_snapshot, notes, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, total, subtotal, tax, shipping, payment_method, addressSnapshot, notes || null, payment_method === 'cod' ? 'pending' : 'paid']
    );
    const orderId = orderResult.insertId;

    // Insert order items & decrement stock
    for (const item of cartItems) {
      await db.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price, image) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.name, item.quantity, item.price, item.image]
      );
      await db.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    // Clear cart
    await db.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    return res.status(201).json({ success: true, message: 'Order placed successfully!', orderId });
  } catch (err) {
    console.error('Place order error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders (user's orders)
const getOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Get items for each order
    for (const order of orders) {
      const [items] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
      if (order.address_snapshot) order.address = JSON.parse(order.address_snapshot);
    }

    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT o.*, u.name as customer_name, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ? AND (o.user_id = ? OR ? = "admin")',
      [req.params.id, req.user.id, req.user.role]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found.' });

    const order = rows[0];
    const [items] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;
    if (order.address_snapshot) order.address = JSON.parse(order.address_snapshot);

    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/orders/:id/cancel (customer can cancel within 4 hours)
const cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  try {
    const [rows] = await db.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = rows[0];

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
    }

    if (order.status === 'delivered' || order.status === 'shipped') {
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is already ${order.status}.` });
    }

    // Check 4-hour window limit
    const orderTime = new Date(order.created_at).getTime();
    const currentTime = new Date().getTime();
    const diffInHours = (currentTime - orderTime) / (1000 * 60 * 60);

    if (diffInHours > 4) {
      return res.status(400).json({
        success: false,
        message: 'Order cancellation window expired. Orders can only be cancelled within 4 hours of placing.',
      });
    }

    // Update order status
    await db.execute('UPDATE orders SET status = "cancelled" WHERE id = ?', [orderId]);

    // Restore product stock
    const [items] = await db.execute('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
    for (const item of items) {
      if (item.product_id) {
        await db.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    return res.json({ success: true, message: 'Order cancelled successfully and stock restored.' });
  } catch (err) {
    console.error('Cancel order error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/orders/:id/status (admin)
const updateOrderStatus = async (req, res) => {
  const { status, payment_status } = req.body;
  try {
    let query = 'UPDATE orders SET ';
    const params = [];
    const updates = [];

    if (status) { updates.push('status = ?'); params.push(status); }
    if (payment_status) { updates.push('payment_status = ?'); params.push(payment_status); }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(req.params.id);

    await db.execute(query, params);
    return res.json({ success: true, message: 'Order status updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/admin/all (admin - all orders)
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, u.name as customer_name, u.email 
       FROM orders o JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC LIMIT 100`
    );
    for (const order of orders) {
      const [items] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
      if (order.address_snapshot) order.address = JSON.parse(order.address_snapshot);
    }
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { placeOrder, getOrders, getOrder, cancelOrder, updateOrderStatus, getAllOrders };
