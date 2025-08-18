const express = require('express');
const router = express.Router();
const { ReadReviews } = require('../models');

router.post('/:reviewId/read', async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const exists = await ReadReviews.findOne({ where: { reviewId } });
    if (exists) return res.status(200).json({ message: 'Already marked as read' });
    const read = await ReadReviews.create({ reviewId });
    res.json(read);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark review as read' });
  }
});

router.get('/', async (req, res) => {
  try {
    const readReviews = await ReadReviews.findAll({ attributes: ['reviewId'] });
    res.json(readReviews.map(r => r.reviewId));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch read reviews' });
  }
});

module.exports = router;