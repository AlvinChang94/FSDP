const express = require('express');
const router = express.Router();
const { TestChat } = require('../models');
const { TestChatMessage } = require('../models');
const { validateToken } = require('../middlewares/auth');
const yup = require("yup");
router.post('/', validateToken, async (req, res) => {
  try {
    const schema = yup.object({
      clientId: yup.number().required()
    });
    const { clientId } = req.body;
    if (parseInt(clientId) !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
    }
    await schema.validate(req.body);
    const now = new Date();
    const chat = await TestChat.create({
      clientId,
      createdAt: now,
      updatedAt: now
    });
    res.json(chat);

  }
  catch (err) {
    console.log(err)
  }

});

router.post('/message', validateToken, async (req, res) => {
  try {
    const schema = yup.object({
      content: yup.string().trim().max(2000, 'Message cannot exceed 2000 characters').required(),
      sender_id: yup.number().required(),
      chat_id: yup.number().required(),
    });
    const { sender_id, chat_id, content } = req.body;
    if (parseInt(sender_id) !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
    }
    await schema.validate(req.body);
    const now = new Date();
    const message = await TestChatMessage.create({
      sender_id,
      chat_id,
      content,
      timestamp: now
    });
    // Update chat's updatedAt
    await TestChat.update({ updatedAt: now }, { where: { chat_id } });
    res.json(message);
  }
  catch (err) {
    console.log(err)
  }

});

router.get('/user/:clientId', validateToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    if (parseInt(clientId) !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
    }
    const chats = await TestChat.findAll({
      where: { clientId },
      order: [['updatedAt', 'DESC']]
    });

    res.json(chats);
  }
  catch (err) {
    console.log(err)
  }
});

router.get('/message/:chat_id', validateToken, async (req, res) => {
  try {
    const { chat_id } = req.params;
    const chat = await TestChat.findByPk(chat_id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found.' });
    }
    if (parseInt(chat.clientId) !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
    }
    const messages = await TestChatMessage.findAll({
      where: { chat_id },
      order: [['timestamp', 'ASC']]
    });
    res.json(messages);
  }
  catch (err) {
    console.log(err)
  }
});

module.exports = router;