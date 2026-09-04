const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, promoteUser } = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.post('/promote/:userId', protect, adminOnly, promoteUser);

module.exports = router;