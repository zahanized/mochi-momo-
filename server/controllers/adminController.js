const User = require('../models/User');
const SoundscapePick = require('../models/SoundscapePick');

const getStats = async (req, res) => {
  try {
    const io = req.app.get('io');

    const activeUsers = io.sockets.sockets.size;

    const openRooms = Array.from(io.sockets.adapter.rooms.keys()).filter((key) =>
      /^[0-9a-f]{24}$/i.test(key)
    ).length;

    const totalUsers = await User.countDocuments();

    const growth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const soundscapePopularity = await SoundscapePick.find().sort({ count: -1 });

    res.json({ activeUsers, openRooms, totalUsers, growth, soundscapePopularity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Only name/email/role — never task, chat, profile bio, or any other
// private content. Keeps FR-3.13's "no individual private data" rule
// intact for everything except the bare identity info promotion needs.
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const promoteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = 'manager';
    await user.save();

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getAllUsers, promoteUser };