const express = require('express');
const router = express.Router();
const { trackPlay } = require('../controllers/soundscapeController');
const protect = require('../middleware/authMiddleware');

router.post('/track', protect, trackPlay);

module.exports = router;