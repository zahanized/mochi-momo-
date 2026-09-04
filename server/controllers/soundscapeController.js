const SoundscapePick = require('../models/SoundscapePick');

const trackPlay = async (req, res) => {
  try {
    const { trackId, label } = req.body;
    if (!trackId) return res.status(400).json({ message: 'trackId is required' });

    const pick = await SoundscapePick.findOneAndUpdate(
      { trackId },
      { $inc: { count: 1 }, $set: { label: label || trackId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(pick);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { trackPlay };