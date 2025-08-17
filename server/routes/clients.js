const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/auth');
const { sequelize, Client, ClientUser } = require('../models'); // adjust names if different

// Get all clients visible to the authenticated user
router.get('/', validateToken, async (req, res) => {
    try {

        // return clients that have a mapping in client_users for this user
        const clients = await Client.findAll({
            include: [{
                model: ClientUser,
                where: { userId: req.userId },
                attributes: ['contactName', 'customFields', 'clientSummary']
            }],
            attributes: ['id', 'phoneNumber',],
            order: [['name', 'ASC']]
        });
        const flat = clients.map(c => {
            const plain = c.get({ plain: true });
            const cu = plain.ClientUsers?.[0] || {};
            return {
                ...plain,
                contactName: cu.contactName || '',
                clientsummary: cu.clientSummary || '',
                customFields: cu.customFields || []
            };
        });
        res.json(flat);

    } catch (err) {
        console.error('GET /api/clients error', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single client (only if belongs to user)
router.get('/:id', validateToken, async (req, res) => {
    try {
        const client = await Client.findOne({
            where: { id: req.params.id },
            include: [{
                model: ClientUser,
                where: { userId: req.userId },
                attributes: []
            }],
            attributes: ['id', 'name', 'number', 'summary', 'nric', 'bank_details']
        });
        if (!client) return res.status(404).json({ error: 'Not found or not authorized' });
        res.json(client);
    } catch (err) {
        console.error('GET /api/clients/:id error', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update client (only allowed if client belongs to user)
router.put('/:id', validateToken, async (req, res) => {
    const clientId = req.params.id;
    const userId = req.user.id;  // assuming you have authentication middleware
    const {
        contactName,
        customFields,
        clientsummary,
        ...rest // any other fields you want to ignore or handle explicitly
    } = req.body;

    try {
        // 1. Find the ClientUser row
        let clientUser = await ClientUser.findOne({
            where: { clientId, userId }
        });

        if (!clientUser) {
            return res.status(404).json({ error: 'ClientUser not found' });
        }

        // 2. Update the specified fields if provided
        if (customFields !== undefined) clientUser.customFields = customFields;
        if (clientsummary !== undefined) clientUser.clientSummary = clientsummary;
        if (contactName !== undefined) clientUser.contactName = contactName;


        // 3. Save changes to DB
        await clientUser.save();

        res.json(clientUser);
    } catch (err) {
        console.error('Failed to update ClientUser', err);
        res.status(500).json({ error: 'Failed to update ClientUser' });
    }
});




module.exports = router;