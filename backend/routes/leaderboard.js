const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// @route   GET /api/leaderboard
// @desc    Get top 5 scores
// @access  Public
router.get('/', async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ score: -1 }) // Sort by score descending
      .limit(5);        // Get top 5
    res.json(scores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/leaderboard
// @desc    Add a new score or update an existing one
// @access  Public
router.post('/', async (req, res) => {
  const { playerName, score } = req.body;

  if (!playerName || score === undefined) {
    return res.status(400).json({ msg: 'Please provide playerName and score' });
  }

  try {
    const existingScore = await Score.findOne({ playerName });

    if (existingScore) {
      // Player exists, check if the new score is higher
      if (score > existingScore.score) {
        // Update the score and timestamp
        existingScore.score = score;
        existingScore.timestamp = Date.now();
        const updatedScore = await existingScore.save();
        res.status(200).json(updatedScore);
      } else {
        // New score is not higher, just return the existing one
        res.status(200).json(existingScore);
      }
    } else {
      // Player does not exist, create a new score entry
      const newScore = new Score({
        playerName,
        score,
      });

      const savedScore = await newScore.save();
      res.status(201).json(savedScore);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/leaderboard
// @desc    Reset all scores
// @access  Public
router.delete('/', async (req, res) => {
  try {
    await Score.deleteMany({});
    res.json({ msg: 'Leaderboard has been reset' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;