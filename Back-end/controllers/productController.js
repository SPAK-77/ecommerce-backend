const db = require('../config/db');

// GET /api/products
const getProducts = async (req, res) => {
  const { category, search, minPrice, maxPrice, featured, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT p.*, c.name as category_name, c.icon as category_icon
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    query += ' AND c.name = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (minPrice) {
    query += ' AND p.price >= ?';
    params.push(parseFloat(minPrice));
  }
  if (maxPrice) {
    query += ' AND p.price <= ?';
    params.push(parseFloat(maxPrice));
  }
  if (featured === 'true') {
    query += ' AND p.is_featured = TRUE';
  }

  // Count total
  const countQuery = query.replace('SELECT p.*, c.name as category_name, c.icon as category_icon', 'SELECT COUNT(*) as total');
  const [countResult] = await db.execute(countQuery, params);
  const total = countResult[0].total;

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  try {
    const [products] = await db.execute(query, params);
    return res.json({
      success: true,
      products,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT p.*, c.name as category_name, c.icon as category_icon FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, product: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/products (admin)
const createProduct = async (req, res) => {
  const { category_id, name, description, price, stock } = req.body;
  const isFeatured = req.body.is_featured === true || req.body.is_featured === 'true' || req.body.is_featured === '1' || req.body.is_featured === 1;
  const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || null);

  try {
    const [result] = await db.execute(
      'INSERT INTO products (category_id, name, description, price, stock, image, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [Number(category_id) || 1, name, description || '', Number(price) || 0, Number(stock) || 0, image, isFeatured]
    );
    return res.status(201).json({ success: true, message: 'Product created.', productId: result.insertId });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  const { category_id, name, description, price, stock } = req.body;
  const isFeatured = req.body.is_featured === true || req.body.is_featured === 'true' || req.body.is_featured === '1' || req.body.is_featured === 1;
  const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image !== undefined ? req.body.image : undefined);

  try {
    let query = 'UPDATE products SET category_id=?, name=?, description=?, price=?, stock=?, is_featured=?';
    const params = [Number(category_id) || 1, name, description || '', Number(price) || 0, Number(stock) || 0, isFeatured];

    if (image !== undefined) {
      query += ', image=?';
      params.push(image);
    }
    query += ' WHERE id=?';
    params.push(req.params.id);

    await db.execute(query, params);
    return res.json({ success: true, message: 'Product updated.' });
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/products/:id (admin)
const deleteProduct = async (req, res) => {
  try {
    await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
