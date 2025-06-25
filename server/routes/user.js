const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
require('dotenv').config();
const { validateToken } = require('../middlewares/auth');
const mutedUsers = new Set();

router.post("/register", async (req, res) => {
    let data = req.body;
    let validationSchema = yup.object({
        name: yup.string().trim().min(3).max(50).required().matches(/^[a-zA-Z '-,.]+$/, "name only allow letters, spaces and characters: ' - , ."),
        email: yup.string().trim().lowercase().email().max(50).required(),
        password: yup.string().trim().min(8).max(50).required().matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, "password at least 1 letter and 1 number")
    });
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });
        let user = await User.findOne({
            where: { email: data.email }
        });
        if (user) {
            res.status(400).json({ message: "Email already exists." });
            return;
        }
        // Hash passowrd
        data.password = await bcrypt.hash(data.password, 10);
        // Create user
        let result = await User.create(data);
        res.json({
            message: `Email ${result.email} was registered successfully.`
        });
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
    }

});
router.post("/login", async (req, res) => {
    let data = req.body;
    let validationSchema = yup.object({
        email: yup.string().trim().lowercase().email().max(50).required(),
        password: yup.string().trim().min(8).max(50).required()
    });
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });
        // Check email and password
        let errorMsg = "Email or password is not correct.";
        let user = await User.findOne({
            where: { email: data.email }
        });
        if (!user) {
            res.status(400).json({ message: errorMsg });
            return;
        }
        let match = await bcrypt.compare(data.password, user.password);
        if (!match) {
            res.status(400).json({ message: errorMsg });
            return;
        }
        // Return user info
        let userInfo = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
        let accessToken = sign(userInfo, process.env.APP_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRES_IN });
        res.json({
            accessToken: accessToken,
            user: userInfo
        });
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});
router.get("/auth", validateToken, (req, res) => {
    let userInfo = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
    };
    res.json({
        user: userInfo
    });
});

router.get('/all', validateToken, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only.' });
  }
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role']
    });
    const usersWithMuted = users.map(u => ({
      ...u.toJSON(),
      muted: mutedUsers.has(String(u.id))
    }));
    res.json(usersWithMuted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});


router.put('/mute/:id', validateToken, (req, res) => {
  const id = req.params.id;
  mutedUsers.add(id);
  res.json({ message: `User ${id} muted.` });
});


router.put('/unmute/:id', validateToken, (req, res) => {
  const id = req.params.id;
  mutedUsers.delete(id);
  res.json({ message: `User ${id} unmuted.` });
});

router.delete('/:id', validateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    mutedUsers.delete(String(user.id)); // Clean up in-memory muted status
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});
module.exports = router;
