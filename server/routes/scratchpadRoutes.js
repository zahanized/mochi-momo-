const express = require('express');
const router = express.Router();
const { addEntry, getEntries } = require('../controllers/scratchpadController');
const protect = require('../middleware/authMiddleware');

router.post('/:roomId', protect, addEntry);
router.get('/:roomId', protect, getEntries);

module.exports = router;