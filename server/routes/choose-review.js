const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  const { reviews, instruction } = req.body;

  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid reviews array' });
  }

  const promptInstruction = instruction || 
    `Based on what you think is most important, such as 1-star or 5-star ratings, mentions of critical issues like data loss, 
    and considering the amount of similar reviews, find and return the most important review.`;

  const prompt = `You are an AI assistant. Given the list of reviews below, ${promptInstruction}

Reviews:
${JSON.stringify(reviews, null, 2)}

Respond ONLY in JSON format with a single review object like this:
{
  "id": number,
  "rating": number,
  "comment": string
}
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

    let cleaned = aiText.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error('Failed to parse AI JSON:', err);
      return res.status(500).json({
        error: 'Failed to parse AI JSON response',
        raw: aiText,
        cleaned,
      });
    }

    return res.json({ review: parsed });
  } catch (error) {
    console.error('Bedrock API error:', error.response?.data || error.message || error);
    return res.status(500).json({
      error: 'Failed to process reviews with AI.',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;