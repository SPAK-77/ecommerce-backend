const db = require('../config/db');

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute(
      'SELECT c.*, COUNT(p.id) as product_count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id ORDER BY c.name'
    );
    return res.json({ success: true, categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/categories (admin)
const createCategory = async (req, res) => {
  const { name, icon, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

  const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || req.body.icon || '📦');

  try {
    const [result] = await db.execute(
      'INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)',
      [name, image, description || null]
    );
    return res.status(201).json({ success: true, message: 'Category created.', categoryId: result.insertId });
  } catch (err) {
    console.error('Create category error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/categories/:id (admin)
const updateCategory = async (req, res) => {
  const { name, icon, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || req.body.icon || undefined);

  try {
    let query = 'UPDATE categories SET name=?, description=?';
    const params = [name, description || null];

    if (image !== undefined) {
      query += ', icon=?';
      params.push(image);
    }
    query += ' WHERE id=?';
    params.push(req.params.id);

    await db.execute(query, params);
    return res.json({ success: true, message: 'Category updated.' });
  } catch (err) {
    console.error('Update category error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/categories/:id (admin)
const deleteCategory = async (req, res) => {
  try {
    await db.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
