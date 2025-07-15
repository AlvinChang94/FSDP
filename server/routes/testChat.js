const express = require('express');
const axios = require('axios');
const router = express.Router();
const { TestChat } = require('../models');
const { TestChatMessage } = require('../models');
const { validateToken } = require('../middlewares/auth');
const yup = require("yup");
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { LexRuntimeV2Client, RecognizeTextCommand } = require('@aws-sdk/client-lex-runtime-v2');
const lexClient = new LexRuntimeV2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

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

router.post('/botmessage', validateToken, async (req, res) => {
  try {
    const schema = yup.object({
      content: yup.string().trim().max(2000, 'Message cannot exceed 2000 characters').required(),
      sender_id: yup.number().required(),
      chat_id: yup.number().required(),
    });

    const { sender_id, chat_id, content, sender } = req.body;
    if (parseInt(sender_id) !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
    }
    await schema.validate(req.body);
    const now = new Date();
    await TestChatMessage.create({
      sender_id,
      chat_id,
      content,
      timestamp: now,
      sender: sender
    });
    const systemPrompt = "You are a Chatbot named 'QueryBot' meant for customers to build. You are developed by Amazon, currently assisting QueryEase in operations, offering the aforementioned solutions. Right now, it is in preview mode, where the business owners test out settings. Please keep your response under 1000 characters. Be concise and try your best not to not exceed this limit. Do not use <pre> tags under any circumstance. The first message from the user is: "
    let messages;
    if (req.body.messages) {
      messages = req.body.messages.map(msg => ({
        role: msg.role,
        content: msg.content.map(text => ({ text }))
      }));

      // If this is the first message (only one user message), concatenate systemPrompt and user message
      if (
        messages.length === 1 &&
        messages[0].role === "user"
      ) {
        // Concatenate systemPrompt and the user's text(s)
        const userTexts = messages[0].content.map(obj => obj.text).join('\n');
        messages = [{
          role: "user",
          content: [{ text: systemPrompt + userTexts }]
        }];
      }
    } else {
      // Fallback: single message
      messages = [
        systemPrompt,
        { role: "user", content: [{ text: req.body.content }] }
      ];
    }
    const apiKey = process.env.AWS_BEARER_TOKEN_BEDROCK;
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
    const reply = response.data.output?.message?.content?.[0]?.text;
    const chatbot_id = 0
    await TestChatMessage.create({
      sender_id: chatbot_id,
      chat_id,
      content: reply,
      timestamp: now,
      sender: 'assistant'
    });
    res.json({ llmReply: reply });
    // Update chat's updatedAt

    await TestChat.update({ updatedAt: now }, { where: { chat_id } });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'Bedrock API error.' });
  }
});

module.exports = router;