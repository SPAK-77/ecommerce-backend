const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/stats', auth, admin, getStats);

module.exports = router;
