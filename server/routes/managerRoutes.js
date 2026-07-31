const express = require('express');
const router = express.Router();
const { getAllUsers, getAllTasks } = require('../controllers/managerController');
const protect = require('../middleware/authMiddleware');
const isManager = require('../middleware/managerMiddleware');

router.get('/users', protect, isManager, getAllUsers);
router.get('/tasks', protect, isManager, getAllTasks);

module.exports = router;