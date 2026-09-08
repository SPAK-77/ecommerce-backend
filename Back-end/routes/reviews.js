const express = require('express');
const router = express.Router();
const { createReview, getReviews, getAllReviewsAdmin, deleteReview } = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, createReview);
router.get('/', getReviews);
router.get('/admin/all', auth, admin, getAllReviewsAdmin);
router.delete('/:id', auth, deleteReview);

module.exports = router;
