const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'manager'],
      default: 'user',
    },
    streakCount: {
      type: Number,
      default: 0,
    },
    lastLoginDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);