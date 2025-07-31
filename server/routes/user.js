const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
require('dotenv').config();
const axios = require('axios');
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
router.get('/auth1', validateToken, async (req, res) => {
  const user = await User.findByPk(req.user.id); // Always fetch fresh from DB
  res.json({ user });
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
      attributes: ['id', 'name', 'email', 'link_code', "phone_num", "business_name", "business_overview"]
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user); // send user data to frontend
  } catch (err) {
    console.error("Error in /user/me:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put('/profile', validateToken, async (req, res) => {
    try {
        const { name, email, phone, businessName, businessDesc, profilePic, password } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone_num = phone;
        if (businessName) user.business_name = businessName;
        if (businessDesc) user.business_overview = businessDesc;
        if (profilePic) user.profile_picture = profilePic;
        if (password) user.password = await bcrypt.hash(password, 10);
        await user.save();
        res.json({ success: true });
    } catch (err) {
      console.log(err)
        res.status(500).json({ error: err });
    }
});

router.post('/generate-overview', validateToken, async (req, res) => {
  try {
    const { businessName, industry, targetAudience, uniqueSellingPoint, extraNotes } = req.body;
    const apiKey = process.env.AWS_BEARER_TOKEN_BEDROCK;

    // Build the AI prompt
    let systemPrompt = `You are an expert business copywriter. Write a concise, clear, and professional business overview (max 3 sentences) for the following business. Do not use <pre> tags.`;

    let userPrompt = `
Business Name: ${businessName}
Industry: ${industry}
Target Audience: ${targetAudience}
Unique Selling Point: ${uniqueSellingPoint}
${extraNotes ? `Extra Notes: ${extraNotes}` : ""}
`;

    const messages = [
      { role: "user", content: [{ text: systemPrompt + "\n" + userPrompt }] }
    ];

    const response = await axios.post(
      'https://bedrock-runtime.ap-southeast-2.amazonaws.com/model/amazon.nova-pro-v1:0/invoke',
      { messages },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const overview = response.data.output?.message?.content?.[0]?.text?.trim() || "No overview generated.";
    res.json({ overview });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to generate overview.' });
  }
});

module.exports = router;
