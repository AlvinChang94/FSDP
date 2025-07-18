const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
require('dotenv').config();
const { validateToken } = require('../middlewares/auth');
function generateLinkCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing chars
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
async function generateUniqueLinkCode() {
  let code;
  let exists = true;
  while (exists) {
    code = generateLinkCode();
    exists = await User.findOne({ where: { link_code: code } });
  }
  return code;
}

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
    data.link_code = await generateUniqueLinkCode();
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
      attributes: ['id', 'name', 'email', 'role', 'muted']
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});


router.put('/mute/:id', validateToken, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only.' });
  }
  const id = req.params.id;
  const user = await User.findByPk(id);
  user.muted = true;
  await user.save();
  res.json({ message: `User ${id} muted.` });
});


router.put('/unmute/:id', validateToken, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only.' });
  }
  const id = req.params.id;
  const user = await User.findByPk(id);
  user.muted = false;
  await user.save();
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

router.get('/me', validateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'link_code']
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user); // send user data to frontend
  } catch (err) {
    console.error("Error in /user/me:", err);
    res.status(500).json({ error: "Server error" });
  }
});

  
module.exports = router;
