const User = require('../models/User');
const Task = require('../models/Task');

const getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password -profilePicture');
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('user', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, getAllTasks };