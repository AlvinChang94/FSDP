const express = require('express');
const router = express.Router();
const { TestChatMessage, TestChat } = require('../models');
const { validateToken } = require('../middlewares/auth');
const Sequelize = require('sequelize');

router.get('/analytics/response-time/:clientId', validateToken, async (req, res) => {
  const { clientId } = req.params;
  if (parseInt(clientId) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
  }

  try {
    const messages = await TestChatMessage.findAll({
      include: {
        model: TestChat,
        where: { clientId: req.user.id }
      },
      order: [['timestamp', 'ASC']]
    });

    const filteredMessages = messages.filter(m => m.sender === 'user' || m.sender === 'assistant');

    let totalTime = 0;
    let count = 0;

    for (let i = 0; i < filteredMessages.length - 1; i++) {
      const current = filteredMessages[i];
      const next = filteredMessages[i + 1];

      if (current.sender === 'user' && next.sender === 'assistant') {
        const diffSeconds = (new Date(next.timestamp) - new Date(current.timestamp)) / 1000;
        if (diffSeconds >= 0) {
          totalTime += diffSeconds;
          count++;
        }
      }
    }

    const averageResponseTime = count > 0 ? parseFloat((totalTime / count).toFixed(2)) : null;
    return res.json({ averageResponseTime });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to calculate average response time.' });
  }
});

router.get('/analytics/message-timings/:clientId', validateToken, async (req, res) => {
  const { clientId } = req.params;
  if (parseInt(clientId) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
  }

  try {
    const messages = await TestChatMessage.findAll({
      include: {
        model: TestChat,
        where: { clientId: req.user.id }
      },
      order: [['timestamp', 'ASC']]
    });

    const filteredMessages = messages.filter(m => m.sender === 'user' || m.sender === 'assistant');

    const timings = [];
    let questionCounter = 1;

    for (let i = 0; i < filteredMessages.length - 1; i++) {
      const current = filteredMessages[i];
      const next = filteredMessages[i + 1];

      if (current.sender === 'user' && next.sender === 'assistant') {
        const diffSeconds = (new Date(next.timestamp) - new Date(current.timestamp)) / 1000;
        if (diffSeconds >= 0) {
          timings.push({
            question: `Q${questionCounter}`,
            time: parseFloat(diffSeconds.toFixed(2))
          });
          questionCounter++;
        }
      }
    }

    return res.json({ timings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch message timings.' });
  }
});

router.get('/analytics/common-topics/:clientId', validateToken, async (req, res) => {
  const clientId = req.params.clientId;

  try {
    const topics = await TestChat.findAll({
      where: { clientId },
      attributes: [
        'title',
        [Sequelize.fn('COUNT', Sequelize.col('chat_id')), 'count']
      ],
      group: ['title'],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 5,
      raw: true
    });

    const result = topics.map(t => ({
      topic: t.title,
      count: parseInt(t.count, 10)
    }));

    return res.json({ topics: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch top topics' });
  }
});




module.exports = router;