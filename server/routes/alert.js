const express = require('express');
const router = express.Router();
const { Alert } = require('../models');
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
    const result = await Alert.create(data);
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

  const list = await Alert.findAll({
    where: condition,
    order: [['createdAt', 'DESC']]
  });

  res.json(list);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const alert = await Alert.findByPk(id);

  if (!alert) {
    res.sendStatus(404);
    return;
  }

  res.json(alert);
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  let data = req.body;

  try {
    data = await validationSchema.validate(data, { abortEarly: false });

    const alert = await Alert.findByPk(id);
    if (!alert) {
      res.sendStatus(404);
      return;
    }

    const num = await Alert.update(data, { where: { id } });
    if (num[0] === 1) {
      res.json({ message: "Alert updated successfully." });
    } else {
      res.status(400).json({ message: `Cannot update alert with id ${id}.` });
    }
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const alert = await Alert.findByPk(id);

  if (!alert) {
    res.sendStatus(404);
    return;
  }

  const num = await Alert.destroy({ where: { id } });
  if (num === 1) {
    res.json({ message: "Alert deleted successfully." });
  } else {
    res.status(400).json({ message: `Cannot delete alert with id ${id}.` });
  }
});

module.exports = router;