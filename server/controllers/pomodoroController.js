const Room = require('../models/Room');
const PomodoroSession = require('../models/PomodoroSession');

const COMPLETION_BUFFER_SECONDS = 2;

const getPhaseDurationSeconds = (session) => {
  const minutes = session.phase === 'work' ? session.workDuration : session.breakDuration;
  return minutes * 60;
};

const checkHost = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) return { room: null, authorized: false };
  return { room, authorized: room.host.toString() === userId.toString() };
};

const emitTimerUpdate = (req, roomId, session) => {
  const io = req.app.get('io');
  io.to(roomId).emit('timerUpdate', session);
};

const getState = async (req, res) => {
  try {
    const { roomId } = req.params;
    const session = await PomodoroSession.findOne({ room: roomId });

    if (!session) {
      return res.json({
        hasSession: false,
        phase: 'work',
        isRunning: false,
        phaseStartedAt: null,
        remainingOnPause: null,
        workDuration: 25,
        breakDuration: 5,
      });
    }

    res.json({ hasSession: true, ...session.toObject() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const startTimer = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { room, authorized } = await checkHost(roomId, req.user._id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!authorized) return res.status(403).json({ message: 'Only the room host can control the timer' });

    const session = await PomodoroSession.findOneAndUpdate(
      { room: roomId },
      {
        room: roomId,
        startedBy: req.user._id,
        phase: 'work',
        isRunning: true,
        phaseStartedAt: new Date(),
        remainingOnPause: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    emitTimerUpdate(req, roomId, session);
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const pauseTimer = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { room, authorized } = await checkHost(roomId, req.user._id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!authorized) return res.status(403).json({ message: 'Only the room host can control the timer' });

    const session = await PomodoroSession.findOne({ room: roomId });
    if (!session) return res.status(404).json({ message: 'No active timer for this room' });
    if (!session.isRunning) return res.json(session);

    const durationSeconds = getPhaseDurationSeconds(session);
    const elapsed = (Date.now() - session.phaseStartedAt.getTime()) / 1000;
    const remaining = Math.max(durationSeconds - elapsed, 0);

    session.isRunning = false;
    session.remainingOnPause = remaining;
    session.phaseStartedAt = null;
    await session.save();

    emitTimerUpdate(req, roomId, session);
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resumeTimer = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { room, authorized } = await checkHost(roomId, req.user._id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!authorized) return res.status(403).json({ message: 'Only the room host can control the timer' });

    const session = await PomodoroSession.findOne({ room: roomId });
    if (!session) return res.status(404).json({ message: 'No active timer for this room' });
    if (session.isRunning) return res.json(session);
    if (session.remainingOnPause == null) {
      return res.status(400).json({ message: 'Timer was never paused' });
    }

    const durationSeconds = getPhaseDurationSeconds(session);
    const alreadyElapsed = durationSeconds - session.remainingOnPause;

    session.isRunning = true;
    session.phaseStartedAt = new Date(Date.now() - alreadyElapsed * 1000);
    session.remainingOnPause = null;
    await session.save();

    emitTimerUpdate(req, roomId, session);
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetTimer = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { room, authorized } = await checkHost(roomId, req.user._id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!authorized) return res.status(403).json({ message: 'Only the room host can control the timer' });

    const session = await PomodoroSession.findOneAndUpdate(
      { room: roomId },
      {
        room: roomId,
        startedBy: req.user._id,
        phase: 'work',
        isRunning: false,
        phaseStartedAt: null,
        remainingOnPause: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    emitTimerUpdate(req, roomId, session);
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completePhase = async (req, res) => {
  try {
    const { roomId } = req.params;

    const session = await PomodoroSession.findOne({ room: roomId });
    if (!session) return res.status(404).json({ message: 'No active timer for this room' });
    if (!session.isRunning || !session.phaseStartedAt) {
      return res.json(session);
    }

    const durationSeconds = getPhaseDurationSeconds(session);
    const elapsed = (Date.now() - session.phaseStartedAt.getTime()) / 1000;

    if (elapsed < durationSeconds - COMPLETION_BUFFER_SECONDS) {
      return res.json(session);
    }

    session.phase = session.phase === 'work' ? 'break' : 'work';
    session.phaseStartedAt = new Date();
    await session.save();

    emitTimerUpdate(req, roomId, session);
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getState,
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  completePhase,
};