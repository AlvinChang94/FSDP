require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
// Simple Route
app.use(cors({
    origin: process.env.CLIENT_URL
    }));

//request and response, respond a "Welcome" message
app.get("/", (req, res) => {
    res.send("Welcome");
});

// establish a valid route with its URL and file path
const tutorialRoute = require('./routes/tutorial');
app.use("/tutorial", tutorialRoute);
const userRoute = require('./routes/user');
app.use("/user", userRoute);
const fileRoute = require('./routes/file');
app.use("/file", fileRoute);

//let port = process.env.APP_PORT;
//app.listen(port, () => {
//    console.log(`Sever running on http://localhost:${port}`);
//});
const db = require('./models');
db.sequelize.sync({ alter: false })
    .then(() => {
        let port = process.env.APP_PORT;
        app.listen(port, () => {
            console.log(`Sever running on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
