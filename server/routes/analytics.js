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

router.get('/analytics/average-chats/:clientId', validateToken, async (req, res) => {
  const { clientId } = req.params;

  if (parseInt(clientId) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
  }

  try {
    const chats = await TestChatMessage.findAll({
      include: [{
        model: TestChat,
        where: { clientId: req.user.id },
        attributes: []
      }],
      where: { sender: 'user' },
      attributes: ['chat_id', 'timestamp'],
      raw: true
    });

    if (chats.length === 0) {
      return res.json({ average_chats_per_day: 0, chatCountsByDay: {} });
    }

    // Group by date
    const chatCountsByDay = {};
    chats.forEach(chat => {
      const date = new Date(chat.timestamp).toISOString().slice(0, 10); // YYYY-MM-DD
      chatCountsByDay[date] = (chatCountsByDay[date] || 0) + 1;
    });

    const dailyCounts = Object.values(chatCountsByDay);
    const totalChats = dailyCounts.reduce((sum, count) => sum + count, 0);
    const average = parseFloat((totalChats / dailyCounts.length).toFixed(2));

    return res.json({
      average_chats_per_day: average,
      chatCountsByDay
    });

  } catch (err) {
    console.error('Average chat route error:', err);
    return res.status(500).json({ error: 'Failed to calculate average chats per day.' });
  }
});


router.get('/analytics/average-chat-groups/:clientId', validateToken, async (req, res) => {
  const { clientId } = req.params;
  
  if (parseInt(clientId) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
  }

  try {
    const messages = await TestChatMessage.findAll({
      include: [{
        model: TestChat,
        where: { clientId: req.user.id },
        attributes: []
      }],
      attributes: ['chat_id', 'timestamp'],
      raw: true
    });


    if (!messages.length) {
      return res.json({ averageGroups: 0, chatGroupsByDay: {} });
    }

    const sessionTracker = {};
    messages.forEach(msg => {
      const date = new Date(msg.timestamp).toISOString().slice(0, 10);
      const key = `${date}:${msg.chat_id}`;
      sessionTracker[key] = true;
    });

    const groupedCounts = {};
    Object.keys(sessionTracker).forEach(key => {
      const [date] = key.split(':');
      groupedCounts[date] = (groupedCounts[date] || 0) + 1;
    });

    const totalSessions = Object.values(groupedCounts).reduce((sum, count) => sum + count, 0);
    const averageGroups = parseFloat((totalSessions / Object.keys(groupedCounts).length).toFixed(2));

    res.json({
      title: 'Chatbot Sessions per Day',
      averageGroups,
      chatGroupsByDay: groupedCounts
    });

  } catch (error) {
    console.error('Failed to compute average chat groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;

