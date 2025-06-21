const express = require('express');
const router = express.Router();
const db = require('../models');
const { validateToken } = require('../middlewares/auth');


// Create a new ticket
router.post('/', validateToken, async (req, res) => {
    try {
        const { clientId } = req.body;
        if (parseInt(clientId) !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
        }
        const now = new Date();
        const ticket = await db.Ticket.create({ clientId, createdAt: now, updatedAt: now });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tickets (for admin)
router.get('/adminget', validateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admins only.' });
        }
        const tickets = await db.Ticket.findAll({
            include: [{ model: db.User, as: 'client' }],
            order: [['updatedAt', 'DESC']]
        });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get tickets for a specific user
router.get('/user/:clientId', validateToken, async (req, res) => {
    try {
        if (parseInt(req.params.clientId) !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
        }
        const tickets = await db.Ticket.findAll({
            where: { clientId: req.params.clientId }
        });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:ticketId', validateToken, async (req, res) => {
    try {
        const ticket = await db.Ticket.findByPk(req.params.ticketId);
        if (ticket.clientId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
        }
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        const { ticketStatus } = req.body;
        ticket.ticketStatus = ticketStatus;
        await ticket.save();
        res.json(ticket);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }

});

router.delete('/:ticketId', validateToken, async (req, res) => {
    try {
        const ticket = await db.Ticket.findByPk(req.params.ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (ticket.clientId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: does not match authenticated user.' });
        }
        await ticket.destroy();
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }

});

module.exports = router;