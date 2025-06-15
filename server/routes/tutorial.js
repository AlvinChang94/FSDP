const express = require('express');
const router = express.Router();
const { User, Tutorial } = require('../models');
const { Op } = require("sequelize");
const yup = require("yup");
const { validateToken } = require('../middlewares/auth');
//let tutorialList = [];
//router.post("/", (req, res) => {
//    let data = req.body;
//    tutorialList.push(data);
//    res.json(data);
//});

//router.post("/", async (req, res) => {
//    let data = req.body;
//    let result = await Tutorial.create(data);
//    res.json(result);
//});

//validate post requests made on /tutorial with 'title' and 'description' keys
router.post("/", validateToken, async (req, res) => {
    let data = req.body;
    data.userId = req.user.id
    // Validate request body
    let validationSchema = yup.object({
        title: yup.string().trim().min(3).max(100).required(),
        description: yup.string().trim().min(3).max(500).required(),
        userId: yup.number().required()

    });
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });
        // Process valid data
        let result = await Tutorial.create(data);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});
//router.get("/", (req, res) => {
//    res.json(tutorialList);
//});

//if there is a search query, returns all the titles and descriptions that match the search query
router.get("/", async (req, res) => {
    let condition = {};
    let search = req.query.search;
    if (search) {
        condition[Op.or] = [
            { title: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
        ];
    }
    // You can add condition for other columns here
    // e.g. condition.columnName = value;

    //if there is no search query, returns all the titles and descriptions
    let list = await Tutorial.findAll({ //await means that the code will wait for the findAll to finish before going to the next line
        where: condition,
        order: [['createdAt', 'DESC']], //the output is in descending order of creation date
        include: { model: User, as: "user", attributes: ['name'] }
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let tutorial = await Tutorial.findByPk(id, {
        include: { model: User, as: "user", attributes: ['name'] }
    }); //looks for id from postman GET request and sends the title and description with that id
    if (!tutorial) {
        res.sendStatus(404);
        return;
    }
    res.json(tutorial);
});

router.put("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    let validationSchema = yup.object({//specifications to validate PUT request from postman using yup
        title: yup.string().trim().min(3).max(100),
        description: yup.string().trim().min(3).max(500)
    });
    let data = req.body;
    try {
        data = await validationSchema.validate(data, //validate data using the above specifications, including the format of title and description
            { abortEarly: false }); //abort early false means validation checks all the fields and returns all errors instead of stopping at the first one 
        let tutorial = await Tutorial.findByPk(id); //validate if id exists
        if (!tutorial) {
            res.sendStatus(404);
            return;
        }
        let userId = req.user.id;
        if (tutorial.userId != userId) {
            res.sendStatus(403);
            return;
        }
        let num = await Tutorial.update(data, { //Actually execute the update
            where: { id: id }
        });
        if (num == 1) { //checks if update is true
            res.json({
                message: "Tutorial was updated successfully."
            });
        }
        else {
            res.status(400).json({
                message: `Cannot update tutorial with id ${id}.`
            });
        }
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
        return;
    }
});

router.delete("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    let tutorial = await Tutorial.findByPk(id);
    if (!tutorial) {
        res.sendStatus(404);
        return;
    }
    let userId = req.user.id;
    if (tutorial.userId != userId) {
        res.sendStatus(403);
        return;
    }
    let num = await Tutorial.destroy({ //deletes tutorial with given id
        where: { id: id }
    })
    if (num == 1) {
        res.json({
            message: "Tutorial was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete tutorial with id ${id}.`
        });
    }
});

module.exports = router;