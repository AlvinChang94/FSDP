const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
require('dotenv').config();
const axios = require('axios');
const { validateToken } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ingestPdf, removePdf } = require('../services/pdfService');




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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userFolder = path.join(__dirname, '../uploaded', String(req.user.id));
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    cb(null, userFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';
  const isPdfMime = file.mimetype === 'application/pdf';

  if (isPdfExt && isPdfMime) {
    cb(null, true); // Accept
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};


const upload = multer({ storage, fileFilter });

// Storage config: save file as "<userid>.<ext>"
const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    const profilePicDir = path.join(__dirname, '../profilepic');
    // Create folder if it doesn't exist
    if (!fs.existsSync(profilePicDir)) {
      fs.mkdirSync(profilePicDir, { recursive: true });
    }

    cb(null, profilePicDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .jpg, .png
    cb(null, `${req.user.id}${ext.toLowerCase()}`);
  }
});
const upload1 = multer({ storage: storage1 });

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

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete error:', err.stack);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

router.get('/me', validateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'link_code', "phone_num", "business_name", "business_overview",]
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error in /user/me:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put('/profile', validateToken, upload1.single('profilePic'), async (req, res) => {
  try {
    const { name, email, phone, businessName, businessDesc, profilePic, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone_num = phone;
    if (businessName) user.business_name = businessName;
    if (businessDesc) user.business_overview = businessDesc;
    if (profilePic) user.profile_picture = profilePic;
    if (newPassword) user.password = await bcrypt.hash(newPassword, 10);
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

router.post("/verify-password", validateToken, async (req, res) => {
  const { currentPassword } = req.body;
  try {
    const user = await User.findByPk(req.user.id); // ✅ correct spelling

    if (!user) {
      return res.status(404).json({ valid: false, message: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    res.json({ valid: isValid });

  } catch (error) {
    console.error(error);
    res.status(500).json({ valid: false, message: "Server error" });
  }
});

router.post(
  '/upload-policy',
  validateToken, // check auth first
  (req, res, next) => {
    upload.array('files')(req, res, function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    const userFolder = path.join(__dirname, '../uploaded', String(req.user.id));
    // Check total folder size
    const files = fs.readdirSync(userFolder);
    const totalSize = files.reduce((acc, file) => {
      const stats = fs.statSync(path.join(userFolder, file));
      return acc + stats.size;
    }, 0);

    if (totalSize > 100 * 1024 * 1024) {
      return res.status(400).json({ message: 'Storage limit exceeded (100MB)' });
    }
    for (const file of req.files) {
      await ingestPdf(req.user.id, file.filename);
    }


    res.json({ message: 'Files uploaded successfully' });
  });

router.get('/policy-files', validateToken, (req, res) => {
  const userFolder = path.join(__dirname, '../uploaded', String(req.user.id));
  if (!fs.existsSync(userFolder)) {
    return res.json([]); // no files yet
  }
  const files = fs.readdirSync(userFolder);
  res.json(files); // just filenames for now
});

router.delete('/policy-files/:filename', validateToken, async (req, res) => {
  try {
    
    const userFolder = path.join(__dirname, '../uploaded', String(req.user.id));
    const filePath = path.join(userFolder, req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    fs.unlinkSync(filePath);
    await removePdf(req.user.id, req.params.filename,);

    res.json({ message: 'File deleted and removed from index' });
  }
  catch (err) {
    console.log(err)
  }
});



router.get('/profilepic/:id', (req, res) => {
  const { id } = req.params;
  const baseDir = path.join(__dirname, '../profilepic');

  const jpgPath = path.join(baseDir, `${id}.jpg`);
  const pngPath = path.join(baseDir, `${id}.png`);

  if (fs.existsSync(jpgPath)) {
    return res.sendFile(jpgPath);
  }
  if (fs.existsSync(pngPath)) {
    return res.sendFile(pngPath);
  }
  return res.status(404).send('No image found');


});

//Auto delete feature
router.get('/auto-delete', validateToken, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json({ autoDelete: user.autoDelete });
});

router.put('/auto-delete', validateToken, async (req, res) => {
  const { autoDelete } = req.body;
  await User.update({ autoDelete }, { where: { id: req.user.id } });
  res.json({ success: true, autoDelete });
});

module.exports = router;
