const express = require('express');
const router = express.Router();
const { ConfigSettings, ThresholdRule, User, Faq } = require('../models');
const { validateToken } = require('../middlewares/auth');
const { ingestFaq } = require('../services/ingestService');
router.use(express.json())

router.post('/tonesettingssave', validateToken, async (req, res) => {
  try {
    const { userId, tone, emojiUsage, signature } = req.body;
    const existing = await ConfigSettings.findOne({ where: { userId } });
    if (existing) {
      await existing.update({ tone, emojiUsage, signature });
    } else {
      await ConfigSettings.create({ userId, tone, emojiUsage, signature });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings.' });
  }
});

router.get('/tonesettings/:userId', validateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = await ConfigSettings.findOne({ where: { userId } });
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

router.get('/rules', validateToken, async (req, res) => {
  try {
    const rules = await ThresholdRule.findAll({ where: { userId: req.user.id }, order: [['updatedAt', 'DESC']] });
    res.json({ rules });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

// create a rule
router.post('/rules', validateToken, async (req, res) => {
  try {
    const { ruleName, triggerType, keyword, action, confidenceThreshold } = req.body;
    const created = await ThresholdRule.create({
      userId: req.user.id,
      ruleName, triggerType, keyword, action,
      confidenceThreshold: typeof confidenceThreshold === 'number' ? confidenceThreshold : 0.8
    });
    res.json({ rule: created });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Failed to create rule' });
  }
});

// update a rule
router.put('/rules/:id', validateToken, async (req, res) => {
  try {
    const rule = await ThresholdRule.findByPk(req.params.id);
    if (!rule || rule.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    await rule.update(req.body);
    res.json({ rule });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Failed to update rule' });
  }
});

// delete a rule
router.delete('/rules/:id', validateToken, async (req, res) => {
  try {
    const rule = await ThresholdRule.findByPk(req.params.id);
    if (!rule || rule.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
    await rule.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Failed to delete rule' });
  }
});

// settings endpoint (holdingMsg, notification method, default confidence etc.)
router.get('/interventionsettings', validateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await ConfigSettings.findOne({ where: { userId } });
    const payload = settings ? settings.toJSON() : null;
    if (payload && payload.notificationMethod) {
      try { payload.notificationMethod = JSON.parse(payload.notificationMethod); } catch (e) { /* keep string if not JSON */ }
    }
    res.json({ settings: payload });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch settings' }); }
});

router.put('/interventionsettings', validateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { holdingMsg, notificationMethod } = req.body;

    const payload = {
      userId,
      // store notificationMethod as JSON string for flexibility
      notificationMethod: (typeof notificationMethod === 'object') ? JSON.stringify(notificationMethod) : notificationMethod,
      holdingMsg
    };

    // remove undefined keys
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    const existing = await ConfigSettings.findOne({ where: { userId } });
    if (existing) {
      await existing.update(payload);
      const updated = existing.toJSON();
      if (updated.notificationMethod) {
        try { updated.notificationMethod = JSON.parse(updated.notificationMethod); } catch (e) { }
      }
      return res.json({ success: true, settings: updated });
    } else {
      const created = await ConfigSettings.create(payload);
      const result = created.toJSON();
      if (result.notificationMethod) {
        try { result.notificationMethod = JSON.parse(result.notificationMethod); } catch (e) { }
      }
      return res.json({ success: true, settings: result });
    }
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to save settings' }); }
});

router.post('/faqmanagement', async (req, res) => {
  const { userId, category, question, answer } = req.body;
  try {
    // generate and store embeddings too
    const faq = await ingestFaq(userId, { category, question, answer });
    res.status(201).json(faq);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating FAQ');
  }
});

// Update
router.put('/faqmanagement/:id', async (req, res) => {
  const { category, question, answer } = req.body;
  try {
    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const faq = await Faq.findByPk(req.params.id);
    if (!faq) return res.sendStatus(404);
    
    // update values
    faq.category = category;
    faq.question = question;
    faq.answer = answer;
    // re‑embed for retrieval
    const { getEmbedding } = require('../services/embeddingService');
    const embQuestion = await getEmbedding(question);
    const embQa = await getEmbedding(`Q: ${question}\nA: ${answer}`);
    faq.embQuestion = Buffer.from(new Float32Array(embQuestion).buffer);
    faq.embQa = Buffer.from(new Float32Array(embQa).buffer);

    await faq.save();
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating FAQ');
  }
});

// Delete
router.delete('/faqmanagement/:id', async (req, res) => {
  try {
    await Faq.destroy({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send('Error deleting FAQ');
  }
});

router.get('/faqmanagement', async (req, res) => {
  try {
    const { userId } = req.query;

    const where = {};
    if (userId) {
      where.userId = userId;
    }

    const faqs = await Faq.findAll({
      where,
      order: [['updatedAt']]
    });

    res.json(faqs);
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    res.status(500).json({ error: 'Server error retrieving FAQs' });
  }
});




module.exports = router;