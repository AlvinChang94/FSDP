const express = require('express');
const axios = require('axios');
const router = express.Router();
const { TestChat } = require('../models');
const { TestChatMessage } = require('../models');
const { validateToken } = require('../middlewares/auth');
const yup = require("yup");
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { LexRuntimeV2Client, RecognizeTextCommand } = require('@aws-sdk/client-lex-runtime-v2');
const bodyParser = require("body-parser");
const twilio = require("twilio");
const lexClient = new LexRuntimeV2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
router.use(bodyParser.json());
const accountSid = process.env.TWILIOID;
const authToken = process.env.TWILIOAUTH;
const client = twilio(accountSid, authToken);

router.post('/', validateToken, async (req, res) => {
  try {
    const schema = yup.object({
      clientId: yup.number().required(),
      content: yup.string().required()
    });
    const { clientId, content } = req.body;
    if (parseInt(clientId) !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
    }
    const systemPrompt = "You are a Chatbot named 'QueryBot' meant for customers to build. You are developed by Amazon, currently assisting QueryEase in operations, offering the aforementioned solutions. Right now, it is in preview mode, where the business owners test out settings. Your job now is to summarise the first message of the conversation into a title. Be as concise and specific as possible. Do not under any circumstance let your output exceed 15 characters. Do not use <pre> tags under any circumstance. The first message from the user is: "
    messages = [{
          role: "user",
          content: [{ text: systemPrompt + content }]
        }];
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
    await schema.validate(req.body);
    const now = new Date();
    const chat = await TestChat.create({
      clientId,
      createdAt: now,
      updatedAt: now,
      title: reply
    });
    res.json(chat);

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

`const invokeLambda = async () => {
  try {
    const response = await axios.post(
      'https://j9f9pqyup2.execute-api.ap-southeast-2.amazonaws.com/default/whatsapp_webhook',
      { message: "Hello from Node.js!" } // Request body
    );

    console.log("Lambda Response:", response.data);
  } catch (error) {
    console.error("Error invoking Lambda:", error.message);
  }
};  
invokeLambda()`

router.post("/receive", async (req, res) => {
  const { ProfileName, Body, From } = req.body;

  try {
    // Just send back what you received or a simple success message
    const response = await client.messages.create({
      from: "whatsapp:+14155238886", // Twilio sandbox number
      to: `${From}`,           // E.g., +60123456789
      body: `To: ${ProfileName} \nBody: ${Body}`,
    });
    res.status(200).json({ success: true, sid: response.sid });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;