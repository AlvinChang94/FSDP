const express = require('express');
const router = express.Router();
const db = require('../models');
const { validateToken } = require('../middlewares/auth');
const yup = require("yup");
// POST /api/messages
router.post('/', validateToken, async (req, res) => {
    try {
        const schema = yup.object({
            content: yup.string().trim().max(2000, 'Message cannot exceed 2000 characters').required(),
            senderId: yup.number().required(),
            recipientId: yup.number().required(),
            ticketId: yup.number().required()
        });
        const { senderId, recipientId, ticketId, content } = req.body;
        if (parseInt(senderId) !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
        }
        await schema.validate(req.body);
        const ticket = await db.Ticket.findByPk(ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (ticket.ticketStatus === 'solved') {
            return res.status(403).json({ error: 'Cannot send messages to a solved ticket.' });
        }
        
        const message = await db.Message.create({
            senderId,
            recipientId,
            ticketId,
            content
        });
        
        ticket.updatedAt = new Date();
        await ticket.save({ fields: ['updatedAt'], validate: false });

        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/conversation/:ticketId', validateToken, async (req, res) => {
    try {
        const ticket = await db.Ticket.findByPk(req.params.ticketId);

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        if (ticket.clientId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
        }
        
        const messages = await db.Message.findAll({
            where: { ticketId: Number(req.params.ticketId) },
            order: [['timestamp', 'ASC']],
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:message_uuid', validateToken, async (req, res) => {
    try {
        const schema = yup.object({
            content: yup.string().trim().max(2000, 'Message cannot exceed 2000 characters').required()
        });
        const { content } = req.body;
        await schema.validate(req.body);
        const message = await db.Message.findOne({ where: { message_uuid: req.params.message_uuid } });
        if (!message) return res.status(404).json({ error: 'Message not found' });
        if (message.senderId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
        }
        if (message.isDeleted){
            return res.status(403).json({ error: 'Forbidden: cannot edit a deleted message.' });
        }
        const ticket = await db.Ticket.findByPk(message.ticketId);
        if (ticket.ticketStatus === 'solved') {
            return res.status(403).json({ error: 'Cannot edit messages in a solved ticket.' });
        }
        
        message.content = content;
        message.isEdited = true;
        await message.save();
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Soft delete message (set content to "This message has been deleted")
router.put('/del/:message_uuid', validateToken, async (req, res) => {
    try {
        const message = await db.Message.findOne({ where: { message_uuid: req.params.message_uuid } });
        if (!message) return res.status(404).json({ error: 'Message not found' });
        if (message.senderId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
        }
        if (message.isDeleted){
            return res.status(403).json({ error: 'Forbidden: cannot delete a deleted message.' });
        }
        const ticket = await db.Ticket.findByPk(message.ticketId);
        if (ticket.ticketStatus === 'solved') {
            return res.status(403).json({ error: 'Cannot delete messages in a solved ticket.' });
        }
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