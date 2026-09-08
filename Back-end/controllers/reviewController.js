const db = require('../config/db');

// Create review table if missing
const initReviewTable = async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);
  } catch (err) {
    console.error('Error creating reviews table:', err);
  }
};
initReviewTable();

// Submit a review (Customer - for Product or General Website)
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5 stars' });
    }

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please enter your review comments' });
    }

    const targetProductId = (product_id && product_id !== 'website') ? product_id : null;

    const [result] = await db.execute(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, targetProductId, rating, comment.trim()]
    );

    // If product_id is provided, update product's average rating and reviews_count
    if (targetProductId) {
      const [avgRows] = await db.execute(
        'SELECT AVG(rating) as avgRating, COUNT(*) as countReviews FROM reviews WHERE product_id = ?',
        [targetProductId]
      );
      const newAvg = Number(avgRows[0].avgRating || rating).toFixed(1);
      const count = avgRows[0].countReviews || 1;

      await db.execute(
        'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
        [newAvg, count, targetProductId]
      );
    }

    res.status(201).json({
      success: true,
      message: targetProductId ? 'Thank you for reviewing this product!' : 'Thank you for reviewing FLIPZONE website!',
      reviewId: result.insertId
    });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ success: false, message: 'Server error while submitting review' });
  }
};

// Get reviews (Public, or filtered by product_id or type=website)
exports.getReviews = async (req, res) => {
  try {
    const { product_id, type } = req.query;
    let query = `
      SELECT r.*, u.name as user_name, u.avatar as user_avatar, p.name as product_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
    `;
    const params = [];

    if (product_id) {
      query += ' WHERE r.product_id = ?';
      params.push(product_id);
    } else if (type === 'website') {
      query += ' WHERE r.product_id IS NULL';
    }

    query += ' ORDER BY r.created_at DESC';

    const [reviews] = await db.execute(query, params);
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching reviews' });
  }
};

// Admin: Get all reviews
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const [reviews] = await db.execute(`
      SELECT r.*, u.name as user_name, u.email as user_email, u.avatar as user_avatar, p.name as product_name, p.image as product_image
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('Admin get reviews error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching all reviews' });
  }
};

// Delete review (Admin or Owner)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [reviews] = await db.execute('SELECT * FROM reviews WHERE id = ?', [id]);
    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const review = reviews[0];
    if (userRole !== 'admin' && review.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this review' });
    }

    await db.execute('DELETE FROM reviews WHERE id = ?', [id]);

    // Recalculate product rating if applicable
    if (review.product_id) {
      const [avgRows] = await db.execute(
        'SELECT AVG(rating) as avgRating, COUNT(*) as countReviews FROM reviews WHERE product_id = ?',
        [review.product_id]
      );
      const newAvg = avgRows[0].countReviews > 0 ? Number(avgRows[0].avgRating).toFixed(1) : 4.0;
      const count = avgRows[0].countReviews || 0;

      await db.execute(
        'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
        [newAvg, count, review.product_id]
      );
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ success: false, message: 'Server error while deleting review' });
  }
};
