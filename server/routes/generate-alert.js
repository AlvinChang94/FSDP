const express = require('express');
const router = express.Router();
const axios = require('axios');
const today = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Singapore', hour12: false });

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Missing message' });
  }

  const prompt = `You are an AI assistant. Today's date amd time is ${today}.
You will be given a message that needs to be summarized into a short alert title and two dates
Given the message below, extract:
1. A short, clear title (maximum 3–5 words, e.g. "Maintenance" or "System Downtime")
2. A reasonable send date and end date in ISO 8601 format (e.g. 2025-07-22T14:00:00Z)

Message: "${message}"

Respond ONLY in JSON format like this:
{ "title": "...", "sendDate": "...", "endDate": "..." }
`;

  console.log('Sending prompt to Bedrock:', prompt);

  try {
    const apiKey = process.env.AWS_BEARER_TOKEN_BEDROCK;

    const response = await axios.post(
      'https://bedrock-runtime.ap-southeast-2.amazonaws.com/model/amazon.nova-pro-v1:0/invoke',
      {
        messages: [
          {
            role: 'user',
            content: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );


    console.log('Raw response data:', response.data);

    const aiText = response.data.output?.message?.content?.[0]?.text;

    if (!aiText) {
      return res.status(500).json({ error: 'AI response missing text' });
    }

    console.log('AI response text:', aiText);

    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (err) {
      console.error('Failed to parse AI JSON:', err);
      return res.status(500).json({ error: 'Failed to parse AI JSON response', raw: aiText });
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Bedrock API error:', error.response?.data || error.message || error);
    return res.status(500).json({
      error: 'Failed to process message with AI.',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
