const mongoose = require('mongoose');

const soundscapePickSchema = new mongoose.Schema({
  trackId: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model('SoundscapePick', soundscapePickSchema);