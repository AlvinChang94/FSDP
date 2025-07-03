const express = require('express');
const router = express.Router();
const { Announcement } = require('../models');
const { Op } = require("sequelize");
const yup = require("yup");

const announcementvalidation = yup.object({
    title: yup.string()
        .trim()
        .min(3, "Title must be at least 3 characters.")
        .max(100, "Title cannot exceed 100 characters.")
        .required("Title is required."),

    content: yup.string()
        .trim()
        .min(3, "Content must be at least 3 characters.")
        .max(2000, "Content cannot exceed 2000 characters.")
        .required("Content is required."),

    AudienceisModerator: yup.boolean(),
    AudienceisUser: yup.boolean(),
    sendNow: yup.boolean(),
    scheduledDate: yup.date().nullable()
});

router.post("/", async (req, res) => {
    let data = req.body;

    // Validate request body
    const validationSchema = announcementvalidation
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });
        // Process valid data
        const result = await Announcement.create(data);
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
            { title: { [Op.like]: `%${search}%` } },
            { content: { [Op.like]: `%${search}%` } }
        ];
    }
    const list = await Announcement.findAll({
        where: condition,
        order: [['createdAt', 'DESC']],
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const announcement = await Announcement.findByPk(id)

    if (!announcement) {
        res.sendStatus(404);
        return;
    }
    res.json(announcement);
});

router.put("/:id", async (req, res) => {
    let id = req.params.id;
    const validationSchema = announcementvalidation
    let data = req.body;
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });
        let announcement = await Announcement.findByPk(id);
        if (!announcement) {
            res.sendStatus(404);
            return;
        }
        let num = await Announcement.update(data, { //Actually execute the update
            where: { id: id }
        });
        if (num == 1) { //checks if update is true
            res.json({
                message: "Announcement was updated successfully."
            });
        }
        else {
            res.status(400).json({
                message: `Cannot update announcement with id ${id}.`
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
    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
        res.sendStatus(404);
        return;
    }

    let num = await Announcement.destroy({
        where: { id: id }
    })
    if (num == 1) {
        res.json({
            message: "Announcement was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete announcement with id ${id}.`
        });
    }
});

module.exports = router;