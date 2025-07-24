const express = require('express');
const router = express.Router();
const { ConfigSettings } = require('../models');
const { validateToken } = require('../middlewares/auth');

router.post('/save', validateToken, async (req, res) => {
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

router.get('/:userId', validateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const settings = await ConfigSettings.findOne({ where: { userId } });
        res.json(settings || {});
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch settings.' });
    }
});

module.exports = router;