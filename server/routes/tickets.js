const express = require('express');
const router = express.Router();
const db = require('../models');

// Create a new ticket
router.post('/', async (req, res) => {
    try {
        const { clientId } = req.body;
        const now = new Date();
        const ticket = await db.Ticket.create({ clientId, createdAt: now, updatedAt: now });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tickets (for admin)
/*router.get('/', async (req, res) => {
    try {
        const tickets = await db.Ticket.findAll({
            include: [{ model: db.User, as: 'client' }]
        });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});*/

// Get tickets for a specific user
router.get('/user/:clientId', async (req, res) => {
    try {
        const tickets = await db.Ticket.findAll({
            where: { clientId: req.params.clientId }
        });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:ticketId', async (req, res) => {
  const { ticketStatus } = req.body;
  const ticket = await db.Ticket.findByPk(req.params.ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  ticket.ticketStatus = ticketStatus;
  await ticket.save();
  res.json(ticket);
});

router.delete('/:ticketId', async (req, res) => {
  const ticket = await db.Ticket.findByPk(req.params.ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  await ticket.destroy();
  res.json({ success: true });
});

module.exports = router;