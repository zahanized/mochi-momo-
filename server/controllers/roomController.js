const bcrypt = require('bcryptjs');
const Room = require('../models/Room');

const createRoom = async (req, res) => {
  try {
    const { name, isPublic, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    if (!isPublic && !password) {
      return res
        .status(400)
        .json({ message: 'Private rooms require a password' });
    }

    const existing = await Room.findOne({ name: name.trim() });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'A room with that name already exists' });
    }

    let hashedPassword = null;
    if (!isPublic) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const room = await Room.create({
      name: name.trim(),
      isPublic: !!isPublic,
      password: hashedPassword,
      host: req.user._id,
    });

    res.status(201).json({
      roomId: room._id,
      name: room.name,
      isPublic: room.isPublic,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { name, password } = req.body;

    const room = await Room.findOne({ name: name.trim() });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isPublic) {
      if (!password) {
        return res
          .status(400)
          .json({ message: 'Password required for this room' });
      }
      const isMatch = await bcrypt.compare(password, room.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
    }

    res.json({
      roomId: room._id,
      name: room.name,
      isPublic: room.isPublic,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPublic: true }).select('name _id');
    const io = req.app.get('io');

    const roomsWithCounts = rooms.map((room) => {
      const roomSockets = io.sockets.adapter.rooms.get(room._id.toString());
      return {
        roomId: room._id,
        name: room.name,
        userCount: roomSockets ? roomSockets.size : 0,
      };
    });

    res.json(roomsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRoom, joinRoom, getPublicRooms };