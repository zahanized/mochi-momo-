const Room = require('../models/Room');
const ScratchpadEntry = require('../models/ScratchpadEntry');

// POST /api/scratchpad/:roomId
const addEntry = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const entry = await ScratchpadEntry.create({
      room: roomId,
      content: content.trim(),
      addedBy: req.user._id,
    });

    const populated = await entry.populate('addedBy', 'name');

    const io = req.app.get('io');
    io.to(roomId).emit('scratchpadUpdate', populated);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/scratchpad/:roomId
const getEntries = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const entries = await ScratchpadEntry.find({ room: roomId })
      .populate('addedBy', 'name')
      .sort({ createdAt: 1 });

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addEntry, getEntries };