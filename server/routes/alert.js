const express = require('express');
const router = express.Router();
const { Alert, UserAlertDismiss } = require('../models');
const { Op } = require('sequelize');
const yup = require('yup');
const { validateToken } = require('../middlewares/auth')

const validationSchema = yup.object({
  title: yup.string().trim().min(3).max(100).required(),
  message: yup.string().trim().min(3).max(500).required(),
  sendDate: yup.date().required(),
  endDate: yup
    .date()
    .min(yup.ref('sendDate'), 'End Date must be after Send Date')
    .required('End Date is required'),
});

router.get("/active", validateToken, async (req, res) => {
    try {
        const now = new Date();

        const dismissed = await UserAlertDismiss.findAll({
            where: { userId: req.user.id },
            attributes: ['alertId']
        });
        const dismissedIds = dismissed.map(d => d.alertId);

        const activeAlerts = await Alert.findAll({
            where: {
                id: { [Op.notIn]: dismissedIds },
                sendDate: { [Op.lte]: now },
                [Op.or]: [
                    { endDate: { [Op.gte]: now } },
                    { endDate: null } 
                ],
                [Op.or]: [
                  { userId: req.userId },
                  { userId: null }
                ]
            },
            order: [['createdAt', 'DESC']]
        });

        res.json(activeAlerts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch active alerts' });
    }
});

router.post('/:id/dismiss', validateToken, async (req, res) => {
    const alertId = req.params.id;
    const userId = req.user.id;

    try {
        const exists = await UserAlertDismiss.findOne({ where: { userId, alertId } });
        if (exists) return res.status(200).json({ message: 'Already dismissed' });

        const dismissed = await UserAlertDismiss.create({ userId, alertId });
        res.json(dismissed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to dismiss alert' });
    }
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