const express = require('express');
const router = express.Router();
const {
  getState,
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  completePhase,
} = require('../controllers/pomodoroController');
const protect = require('../middleware/authMiddleware');

router.get('/:roomId', protect, getState);
router.post('/:roomId/start', protect, startTimer);
router.post('/:roomId/pause', protect, pauseTimer);
router.post('/:roomId/resume', protect, resumeTimer);
router.post('/:roomId/reset', protect, resetTimer);
router.post('/:roomId/complete', protect, completePhase);

module.exports = router;