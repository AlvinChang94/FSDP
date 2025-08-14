const express = require('express');
const router = express.Router();
const { ClientMessage } = require('../models');
const { Op } = require("sequelize");
const yup = require("yup");

const clientmsgvalidation = yup.object({
    message_uuid: yup.string()
        .trim()
        .uuid("Invalid UUID format.") // enforces a strict RFC 4122 format (which is always 36 characters and includes hyphens (-))
        .required("Message UUID is required."),

    senderPhone: yup.string()
        .trim()
        .max(255, "Sender's Phone Number cannot exceed 255 characters.")
        .required("Sender's Phone Number is required."),

    senderName: yup.string()
        .trim()
        .max(255, "Sender's Name cannot exceed 255 characters.")
        .nullable(),

    userId: yup.number()
        .integer()
        .nullable(),

    content: yup.string()
        .trim()
        .required("Content of message is required."),

    timestamp: yup.date()
        .required("Timestamp of message is required."),

});

router.get("/", async (req, res) => {
    const condition = {};
    const search = req.query.search;
    if (search) {
        const isNum  = Number.isInteger(Number(search));
        condition[Op.or] = [
            ...(isNum ? [
                { id: Number(search) },
                { userId: Number(search) },
            ] : []),
            { senderPhone: { [Op.like]: `%${search}%` } },
            { senderName: { [Op.like]: `%${search}%` } },
        ];
    }
    const list = await ClientMessage.findAll({
        where: condition,
        order: [['id', 'DESC']],
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const clientmsg = await ClientMessage.findByPk(id)

    if (!clientmsg) {
        res.sendStatus(404);
        return;
    }
    res.json(clientmsg);
});

module.exports = router;