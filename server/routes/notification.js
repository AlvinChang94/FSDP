const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { Op } = require('sequelize');
const yup = require('yup');

const validationSchema = yup.object({
  title: yup.string().trim().min(3).max(100).required(),
  message: yup.string().trim().min(3).max(500).required(),
  sendDate: yup.date().required(),
});

router.post("/", async (req, res) => {
  let data = req.body;
  try {
    data = await validationSchema.validate(data, { abortEarly: false });
    const result = await Notification.create(data);
    res.json(result);
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
});

router.get("/", async (req, res) => {
  const condition = {};
  const search = req.query.search;

  if (search) {
    condition[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { message: { [Op.like]: `%${search}%` } }
    ];
  }

  const list = await Notification.findAll({
    where: condition,
    order: [['createdAt', 'DESC']]
  });

  res.json(list);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const notification = await Notification.findByPk(id);

  if (!notification) {
    res.sendStatus(404);
    return;
  }

  res.json(notification);
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  let data = req.body;

  try {
    data = await validationSchema.validate(data, { abortEarly: false });

    const notification = await Notification.findByPk(id);
    if (!notification) {
      res.sendStatus(404);
      return;
    }

    const num = await Notification.update(data, { where: { id } });
    if (num[0] === 1) {
      res.json({ message: "Notification updated successfully." });
    } else {
      res.status(400).json({ message: `Cannot update notification with id ${id}.` });
    }
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const notification = await Notification.findByPk(id);

  if (!notification) {
    res.sendStatus(404);
    return;
  }

  const num = await Notification.destroy({ where: { id } });
  if (num === 1) {
    res.json({ message: "Notification deleted successfully." });
  } else {
    res.status(400).json({ message: `Cannot delete notification with id ${id}.` });
  }
});

module.exports = router;