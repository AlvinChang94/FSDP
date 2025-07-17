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
const messageRoutes = require('./routes/messages');
app.use('/api/messages', messageRoutes);
const ticketRoutes = require('./routes/tickets')
app.use('/api/ticket', ticketRoutes)
const alertRoutes = require('./routes/alert');
app.use('/alert', alertRoutes);
const testChatRoutes = require('./routes/TestChat')
app.use('/api/testchat', testChatRoutes);
const announcementRoutes = require('./routes/announcements')
app.use('/announcements', announcementRoutes)
const reviewRoutes = require('./routes/Review')
app.use ('/reviews', reviewRoutes)

const db = require('./models');
const bcrypt = require('bcrypt');
db.sequelize.sync({ alter: false }).then(async () => {
    // Check if admin exists
    const admin = await db.User.findOne({ where: { email: 'joe@gmail.com' } });
    if (!admin) {
        const hashedPassword = await bcrypt.hash('Admin1234', 10);
        await db.User.create({
            id: 0,
            name: 'Joe',
            email: 'joe@gmail.com',
            password: hashedPassword, // You should hash this in production!
            role: 'admin'
        });
        console.log('Default admin user created.');
    }
    let port = process.env.APP_PORT;
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}).catch((err) => {
    console.log(err);
});
