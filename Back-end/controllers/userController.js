const db = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const [addresses] = await db.execute('SELECT * FROM addresses WHERE user_id = ?', [req.user.id]);
    return res.json({ success: true, user: rows[0], addresses });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error!!.' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  const { name, phone, avatarUrl } = req.body;
  let avatar = req.file ? `/uploads/${req.file.filename}` : (avatarUrl !== undefined ? avatarUrl : undefined);

  try {
    let query = 'UPDATE users SET name = ?, phone = ?';
    const params = [name, phone];
    if (avatar !== undefined && avatar !== null && avatar !== '') { query += ', avatar = ?'; params.push(avatar); }
    query += ' WHERE id = ?';
    params.push(req.user.id);

    await db.execute(query, params);
    return res.json({ success: true, message: 'Profile updated.', avatar });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/users/password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const [rows] = await db.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/users/address
const addAddress = async (req, res) => {
  const { label, street, city, state, zip, country, is_default } = req.body;
  try {
    if (is_default) {
      await db.execute('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    }
    const [result] = await db.execute(
      'INSERT INTO addresses (user_id, label, street, city, state, zip, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, label || 'Home', street, city, state, zip, country || 'India', is_default || false]
    );
    return res.status(201).json({ success: true, message: 'Address saved.', addressId: result.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/users/address/:id
const deleteAddress = async (req, res) => {
  try {
    await db.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.json({ success: true, message: 'Address deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/users/all (admin)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
    );
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getProfile, updateProfile, changePassword, addAddress, deleteAddress, getAllUsers };
