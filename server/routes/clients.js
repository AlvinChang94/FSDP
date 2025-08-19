const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/auth');
const axios = require('axios');
const { Client, ClientUser, ClientMessage } = require('../models'); // adjust names if different
const { sequelize } = require('../models');


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
            attributes: ['id', 'name', 'phoneNumber',],
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
                attributes: ['clientSummary', 'customFields']
            }],
            attributes: ['id', 'name', 'number',]
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

router.post('/generate-summary', async (req, res) => {
    try {
        const { clientId, userId } = req.body;
        const client = await Client.findOne({
            where: { id: clientId }
        });
        const clientUser = await ClientUser.findOne({
            where: { clientId: clientId, userId: userId }
        })
        const rows = await sequelize.query(
            `
          SELECT
            u.user_id                AS userIdMsgId,
            u.senderPhone       AS userSenderPhone,
            u.content           AS userMessage,
            u.\`timestamp\`      AS userTimestamp,
        
            r.user_id                AS nextId,
            r.senderPhone       AS nextSenderPhone,
            r.content           AS nextMessage,
            r.\`timestamp\`      AS nextTimestamp
          FROM \`client_messages\` u
          LEFT JOIN \`client_messages\` r
            ON r.user_Id = u.user_Id
           AND r.\`timestamp\` = (
              SELECT MIN(cm.\`timestamp\`)
              FROM \`client_messages\` cm
              WHERE cm.user_Id = u.user_Id
                AND cm.\`timestamp\` > u.\`timestamp\`
           )
          WHERE u.user_Id = :user_Id
            AND u.senderPhone = :fromPhone
          ORDER BY u.\`timestamp\` ASC
          `,
            {
                replacements: { user_Id: userId, fromPhone: client.phoneNumber },
                type: sequelize.QueryTypes.SELECT
            }
        );

        // Optional: shape them into neat pairs
        const chatHistory = rows.map(r => ({
            userMessage: {
                id: r.userIdMsgId,
                senderPhone: r.userSenderPhone,
                content: r.userMessage,
                timestamp: r.userTimestamp
            },
            nextMessage: r.nextId
                ? {
                    id: r.nextId,
                    senderPhone: r.nextSenderPhone,
                    content: r.nextMessage,
                    timestamp: r.nextTimestamp
                }
                : null
        }));
        const formattedMessages = [];

        chatHistory.forEach(pair => {
            if (pair.userMessage) {
                formattedMessages.push({
                    role: 'user',
                    content: [{ type: "text", text: pair.userMessage.content || "" }]
                });
            }
            if (pair.nextMessage) {
                formattedMessages.push({
                    role: 'assistant',
                    content: [{ type: "text", text: pair.nextMessage.content || "" }]
                });
            }
        });

        let systemprompt = `You are a client profiling assistant.

You will be provided with the full sequence of messages from a conversation between a business and a client (name: ${clientUser.contactName || client.name}), in chronological order. These messages may contain greetings, questions, requests, clarifications, personal details, preferences, and any other relevant context.

Your task is to read all the messages carefully and produce a concise but comprehensive summary of the client. The summary should focus on:

- The client’s stated needs, goals, or problems.
- Any personal details they’ve shared (e.g., name, location, preferences) that are relevant to future interactions.
- The tone and sentiment they’ve expressed.
- Key actions requested or completed.
- Any constraints, priorities, or conditions mentioned.

Guidelines:
- Do not quote every message — condense into meaningful insights.
- Use clear, professional language.
- Exclude unrelated small talk unless it meaningfully informs the profile.
- Divide content by headers, such as '**Key Characteristucs**'
- Assume this summary will be used by another person to quickly understand the client before engaging with them again.

Output only the summary in plain text.`
        let summary
        if (!formattedMessages || formattedMessages.length === 0) {
            return res.json({ summary });;
        }

        const requestBody = {
            system: systemprompt,
            messages: [
                ...formattedMessages,
                {
                    role: "user",
                    content: [{ type: "text", text: "Generate the summary" }].filter(Boolean)
                }
            ]
            ,
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 500

        };
        const apiKey = process.env.AWS_BEARER_TOKEN_BEDROCK;
        const aiResponse = await axios.post(
            `https://bedrock-runtime.ap-southeast-2.amazonaws.com/model/${encodeURIComponent('arn:aws:bedrock:ap-southeast-2:175261507723:inference-profile/apac.anthropic.claude-sonnet-4-20250514-v1:0')}/invoke`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                validateStatus: () => true
            }
        );

        if (aiResponse.status < 200 || aiResponse.status >= 300) {
            console.log('Model error:', aiResponse.status, aiResponse.data);
            throw new Error(`Model request failed ${aiResponse.status}`);
        }

        const body = aiResponse.data;
        const blocks = body.content?.flat?.() || [];
        summary = blocks.map(b => b.text || "").join("").trim()
            || body.output?.message?.content?.[0]?.text?.trim()
            || "";
        //console.log(JSON.stringify(requestBody.messages, null, 2));]
        res.json({ summary });
    }
    catch (err) {
        console.log(err)
    }
});




module.exports = router;