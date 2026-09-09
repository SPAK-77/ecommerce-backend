const db = require('../config/db');

// GET /api/products
const getProducts = async (req, res) => {
  const { category, search, minPrice, maxPrice, featured, page = 1, limit = 12 } = req.query;
  const numLimit = Math.max(1, parseInt(limit, 10) || 12);
  const numPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (numPage - 1) * numLimit;

  let whereClauses = ['1=1'];
  const params = [];

  if (category) {
    whereClauses.push('c.name = ?');
    params.push(category);
  }
  if (search) {
    whereClauses.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (minPrice) {
    whereClauses.push('p.price >= ?');
    params.push(parseFloat(minPrice));
  }
  if (maxPrice) {
    whereClauses.push('p.price <= ?');
    params.push(parseFloat(maxPrice));
  }
  if (featured === 'true') {
    whereClauses.push('p.is_featured = TRUE');
  }

  const whereSql = whereClauses.join(' AND ');

  try {
    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereSql}
    `;
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Fetch paginated products
    const query = `
      SELECT p.*, c.name as category_name, c.icon as category_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereSql}
      ORDER BY p.created_at DESC
      LIMIT ${numLimit} OFFSET ${offset}
    `;
    const [products] = await db.query(query, params);

    return res.json({
      success: true,
      products,
      pagination: {
        page: numPage,
        limit: numLimit,
        total,
        pages: Math.ceil(total / numLimit),
      },
    });
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching products.' });
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
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Product name is required.' });
  }

  const isFeatured = req.body.is_featured === true || req.body.is_featured === 'true' || req.body.is_featured === '1' || req.body.is_featured === 1;
  const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || null);

  try {
    // Check if category exists or use default first category
    let targetCatId = Number(category_id);
    if (!targetCatId || isNaN(targetCatId)) {
      const [cats] = await db.execute('SELECT id FROM categories ORDER BY id ASC LIMIT 1');
      targetCatId = cats.length > 0 ? cats[0].id : 1;
    }

    const [result] = await db.execute(
      'INSERT INTO products (category_id, name, description, price, stock, image, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [targetCatId, name.trim(), description || '', Number(price) || 0, Number(stock) || 0, image, isFeatured]
    );
    return res.status(201).json({ success: true, message: 'Product created.', productId: result.insertId });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ success: false, message: 'Server error while creating product.' });
  }
};

// PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  const { category_id, name, description, price, stock } = req.body;
  const isFeatured = req.body.is_featured === true || req.body.is_featured === 'true' || req.body.is_featured === '1' || req.body.is_featured === 1;
  const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image !== undefined ? req.body.image : undefined);

  try {
    let targetCatId = Number(category_id);
    if (!targetCatId || isNaN(targetCatId)) {
      const [cats] = await db.execute('SELECT id FROM categories ORDER BY id ASC LIMIT 1');
      targetCatId = cats.length > 0 ? cats[0].id : 1;
    }

    let query = 'UPDATE products SET category_id=?, name=?, description=?, price=?, stock=?, is_featured=?';
    const params = [targetCatId, name, description || '', Number(price) || 0, Number(stock) || 0, isFeatured];

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
    return res.status(500).json({ success: false, message: 'Server error while updating product.' });
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

