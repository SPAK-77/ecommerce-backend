const express = require('express');
const router = express.Router();
const { placeOrder, getOrders, getOrder, cancelOrder, updateOrderStatus, getAllOrders } = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, placeOrder);
router.get('/', auth, getOrders);
router.get('/admin/all', auth, admin, getAllOrders);
router.get('/:id', auth, getOrder);
router.put('/:id/cancel', auth, cancelOrder);
router.put('/:id/status', auth, admin, updateOrderStatus);

module.exports = router;
