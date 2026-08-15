const mongoose = require('mongoose');

const pomodoroSessionSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      unique: true, // one active timer session per room
    },
    startedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workDuration: {
      type: Number, // minutes
      default: 25,
    },
    breakDuration: {
      type: Number, // minutes
      default: 5,
    },
    phase: {
      type: String,
      enum: ['work', 'break'],
      default: 'work',
    },
    isRunning: {
      type: Boolean,
      default: false,
    },
    phaseStartedAt: {
      type: Date,
      default: null, // server timestamp anchor for the currently running phase
    },
    remainingOnPause: {
      type: Number, // seconds left when paused, so resume doesn't lose position
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PomodoroSession', pomodoroSessionSchema);