const express = require('express');
const router = express.Router();
const { Escalation } = require('../models');
const { Op } = require("sequelize");
const yup = require("yup");
const axios = require('axios');
const { LexRuntimeV2Client, RecognizeTextCommand } = require('@aws-sdk/client-lex-runtime-v2');
const bodyParser = require("body-parser");
const twilio = require("twilio");
const cooldownMap = new Map();
const { ConfigSettings } = require('../models');
const lexClient = new LexRuntimeV2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


const escalationvalidation = yup.object({
    escalationId: yup.number().integer(),
    clientId: yup.number().integer(),
    chathistory: yup.string().max(2000),
    chatsummary: yup.string().max(2000),
});
router.post('/generate-summary', async (req, res) => {
  try {
    const schema = yup.object({
      clientId: yup.number().required(),
      chathistory: yup.string().required()
    });
    const { clientId, chathistory } = req.body;
    const systemPrompt = `You are a financial advisor assistant. Summarize the following client-chatbot conversation into a short and clear summary of the client's concern, suitable for quick review by a human advisor. Do not start the summary with the word "Summary" or any similar heading.`;
    messages = [{
      role: "user",
      content: [{text: systemPrompt + chathistory}],
    }];
    const apiKey = process.env.AWS_BEARER_TOKEN_BEDROCK;
    const response = await axios.post(
      'https://bedrock-runtime.ap-southeast-2.amazonaws.com/model/amazon.nova-pro-v1:0/invoke',
      { messages },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    const chatsummary = response.data.output?.message?.content?.[0]?.text;
    await schema.validate(req.body);
    const escalation = await Escalation.findByPk(clientId)
    if (escalation) {
        escalation.chatsummary = chatsummary
        await escalation.save()
    }
    res.json(escalation);

  }
  catch (err) {
    console.log(err)
  }

});

router.post("/", async (req, res) => {
    let data = req.body;

    // Validate request body
    const validationSchema = escalationvalidation
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });
        // Process valid data
        const result = await Escalation.create(data);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});

router.get("/", async (req, res) => {
    const condition = {};
    const search = req.query.search;
    if (search) {
        condition[Op.or] = [
            { escalationId: { [Op.like]: `%${search}%` } },
        ];
    }
    const list = await Escalation.findAll({
        where: condition,
        order: [['createdAt', 'ASC']],
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const escalation = await Escalation.findByPk(id)

    if (!escalation) {
        res.sendStatus(404);
        return;
    }
    res.json(escalation);
});

router.put("/:id", async (req, res) => {
    let id = req.params.id;
    const validationSchema = escalationvalidation
    let data = req.body;
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });
        let escalation = await Escalation.findByPk(id);
        if (!escalation) {
            res.sendStatus(404);
            return;
        }
        let num = await Escalation.update(data, { //Actually execute the update
            where: { id: id }
        });
        if (num == 1) { //checks if update is true
            res.json({
                message: "Escalation was updated successfully."
            });
        }
        else {
            res.status(400).json({
                message: `Cannot update Escalation with id ${id}.`
            });
        }
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
        return;
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    const escalation = await Escalation.findByPk(id);
    if (!escalation) {
        res.sendStatus(404);
        return;
    }

    let num = await Escalation.destroy({
        where: { id: id }
    })
    if (num == 1) {
        res.json({
            message: "Escalation was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete escalation with id ${id}.`
        });
    }
});

module.exports = router;