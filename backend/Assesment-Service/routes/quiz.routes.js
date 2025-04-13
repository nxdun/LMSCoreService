const express = require('express');
const quizService = require('../services/QuizeService');
const router = express.Router();

// Create quiz
router.post('/', async (req, res) => {
  try {
    const quiz = await quizService.createQuiz(req.body);
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz attempt
router.post('/:id/attempt', async (req, res) => {
  try {
    const { userId, answers } = req.body;
    const attempt = await quizService.submitQuizAttempt(req.params.id, userId, answers);
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Other routes: update quiz, delete quiz, get attempts, etc.

module.exports = router;