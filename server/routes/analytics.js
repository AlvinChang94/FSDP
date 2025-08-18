const express = require('express');
const router = express.Router();
const { TestChatMessage, TestChat } = require('../models');
const { ClientMessage } = require('../models');
const { validateToken } = require('../middlewares/auth');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');


router.get('/analytics/response-time/:clientId', validateToken, async (req, res) => {
  const { clientId } = req.params;

  if (parseInt(clientId) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
  }

  try {
    const messages = await ClientMessage.findAll({
      where: {
        userId: req.user.id,
        timestamp: { [Sequelize.Op.ne]: null },
      },
      order: [['timestamp', 'ASC']]
    });

    let totalTime = 0;
    let count = 0;

    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];

      if (current.senderName !== 'QueryBot' && next.senderName === 'QueryBot') {
        const receivedTime = new Date(current.timestamp);
        const responseTime = new Date(next.timestamp);
        const diffSeconds = (responseTime - receivedTime) / 1000;

        if (diffSeconds >= 0 && diffSeconds < 3600) {
          totalTime += diffSeconds;
          count++;
        }
      }
    }



    const averageResponseTime = count > 0 ? parseFloat((totalTime / count).toFixed(2)) : null;
    return res.json({ averageResponseTime, messagePairs: count });

  } catch (err) {
    console.error('Error calculating WhatsApp response time:', err);
    return res.status(500).json({ error: 'Failed to calculate average response time.' });
  }
});



router.get('/analytics/message-timings/:clientId', validateToken, async (req, res) => {
  const { clientId } = req.params;
  if (parseInt(clientId) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
  }

  try {
    const messages = await ClientMessage.findAll({
      where: {
        userId: req.user.id,
        timestamp: { [Sequelize.Op.ne]: null }
      },
      order: [['timestamp', 'ASC']]
    });

    const timings = [];
    let questionCounter = 1;

    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];

      if (current.senderName !== 'QueryBot' && next.senderName === 'QueryBot') {
        const receivedTime = new Date(current.timestamp);
        const responseTime = new Date(next.timestamp);
        const diffSeconds = (responseTime - receivedTime) / 1000;

        if (diffSeconds >= 0 && diffSeconds < 3600) {
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
    console.error('Error fetching WhatsApp message timings:', err);
    return res.status(500).json({ error: 'Failed to fetch message timings.' });
  }
});


router.get('/analytics/average-chats/:clientId', validateToken, async (req, res) => {
  const { clientId } = req.params;

  if (parseInt(clientId) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
  }

  try {
    const messages = await ClientMessage.findAll({
      where: {
        user_id: clientId,
        senderName: { [Op.ne]: 'QueryBot' }
      },
      attributes: ['timestamp'],
      raw: true
    });

    if (!messages.length) {
      return res.json({ average_chats_per_day: 0, chatCountsByDay: {} });
    }

    const chatCountsByDay = {};
    messages.forEach(msg => {
      if (!msg.timestamp) return;
      const date = new Date(msg.timestamp).toISOString().slice(0, 10);
      chatCountsByDay[date] = (chatCountsByDay[date] || 0) + 1;
    });

    const dailyCounts = Object.values(chatCountsByDay);
    const totalChats = dailyCounts.reduce((sum, count) => sum + count, 0);
    const average = Math.round(totalChats / dailyCounts.length);

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

