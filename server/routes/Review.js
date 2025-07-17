const express = require('express');
const router = express.Router();
const { Review } = require('../models');
const yup = require('yup');

const validationSchema = yup.object({
  rating: yup.number().min(1).max(5).required(),
  comment: yup.string().trim().min(3).max(500).required(),
});

router.post('/', async (req, res) => {
  try {
    const data = await validationSchema.validate(req.body, { abortEarly: false });
    const review = await Review.create(data);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ errors: err.errors || err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.sendStatus(404);
    }
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch review' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await validationSchema.validate(req.body, { abortEarly: false });
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.sendStatus(404);
    }
    await review.update(data);
    res.json({ message: 'Review updated successfully.' });
  } catch (err) {
    res.status(400).json({ errors: err.errors || err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.sendStatus(404);
    }
    await review.destroy();
    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

module.exports = router;