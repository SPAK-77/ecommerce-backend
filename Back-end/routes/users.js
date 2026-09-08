const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getProfile, updateProfile, changePassword, addAddress, deleteAddress, getAllUsers } = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, 'avatar_' + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('avatar'), updateProfile);
router.put('/password', auth, changePassword);
router.post('/address', auth, addAddress);
router.delete('/address/:id', auth, deleteAddress);
router.get('/all', auth, admin, getAllUsers);

module.exports = router;
