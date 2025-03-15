// controllers/ratingController.js
const Rating = require('../models/rating');

exports.getRatings = async (req, res) => {
  try {
    const ratings = await Rating.find();
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRating = async (req, res) => {
  try {
    // Assuming you have a 'courseId' field in your Rating model
    const ratings = await Rating.findOne({courseId:req.params.id });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.createRating = async (req, res) => {
  const { user,courseId, value, comment } = req.body;
  try {
    const rating = await Rating.create({ user,courseId, value, comment });
    res.status(201).json(rating);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
