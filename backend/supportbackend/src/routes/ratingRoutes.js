// routes/ratingRoutes.js
const express = require('express');
const RatingRouter = express.Router();
const ratingController = require('../controllers/ratingController');

RatingRouter.get('/ratings', ratingController.getRatings);
RatingRouter.post('/ratings', ratingController.createRating);
RatingRouter.get('/ratings/:id', ratingController.getRating);

module.exports = RatingRouter;
