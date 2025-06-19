const express = require('express');
const router = express.Router();
const db = require('../models');

// POST /api/messages
router.post('/', async (req, res) => {
    try {
        const { senderId, recipientId, ticketId, content } = req.body;
        const message = await db.Message.create({
            senderId,
            recipientId,
            ticketId,
            content
        });
        const ticket = await db.Ticket.findByPk(ticketId);
        ticket.updatedAt = new Date();
        await ticket.save({ fields: ['updatedAt'], validate: false });

        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/conversation/:ticketId', async (req, res) => {
    try {
        const messages = await db.Message.findAll({
            where: { ticketId: Number(req.params.ticketId) },
            order: [['timestamp', 'ASC']],
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:message_uuid', async (req, res) => {
    try {
        const { content } = req.body;
        const message = await db.Message.findOne({ where: { message_uuid: req.params.message_uuid } });
        if (!message) return res.status(404).json({ error: 'Message not found' });
        message.content = content;
        message.isEdited = true;
        await message.save();
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Soft delete message (set content to "This message has been deleted")
router.put('/del/:message_uuid', async (req, res) => {
    try {
        const message = await db.Message.findOne({ where: { message_uuid: req.params.message_uuid } });
        if (!message) return res.status(404).json({ error: 'Message not found' });
        message.content = "";
        message.isDeleted = true;
        message.isEdited = false;
        await message.save();
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;