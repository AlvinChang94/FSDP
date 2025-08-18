require('dotenv').config();
const { validateToken } = require('./middlewares/auth');
const cors = require('cors');
const express = require('express');
const path = require('path');
const {
    startSession,
    getLastUpdate,
    logoutSession,
} = require('./services/whatsapp');
const { User } = require('./models');

const app = express();
// Simple Route
app.use(cors({
    origin: '*', credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// Start or resume
app.post('/api/wa/:userId/start', (req, res) => {
    console.log(`Starting WA session for user ${req.params.userId}`)
    const state = startSession(req.params.userId);
  res.json(state.lastUpdate);
});

// Poll status
app.get('/api/wa/:userId/status', (req, res) => {
    const { userId } = req.params;
    res.json(getLastUpdate(userId));
});

// Logout/delink
app.post('/api/wa/:userId/logout', async (req, res) => {
    const ok = await logoutSession(req.params.userId);
  res.json({ status: ok ? 'delinked' : 'not_found' });

});

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
app.use('/reviews', reviewRoutes)
const configRoute = require('./routes/user_chatbot_config')
app.use('/api/config', configRoute)
const generateAlertRoutes = require('./routes/generate-alert');
app.use('/generate-alert', generateAlertRoutes);
const chooseReviews = require('./routes/choose-review')
app.use('/choose-review', chooseReviews)
const analyticsRoutes = require('./routes/analytics');
app.use('/api', analyticsRoutes);
const escalationRoutes = require('./routes/escalations')
app.use('/escalations', escalationRoutes)
const clientmsgRoutes = require('./routes/client_messages_routes');
app.use('/client_messages', clientmsgRoutes);
const chatbotRoutes = require('./routes/chatbot')
app.use('/sendchatbot', chatbotRoutes)
const myclients = require('./routes/clients')
app.use('/api/clients', myclients)
const readReviewsRoutes = require('./routes/readReviews');
app.use('/read-reviews', readReviewsRoutes);


const db = require('./models');
const bcrypt = require('bcrypt');
const router = require('./routes/tutorial');
db.sequelize.sync({ alter: false }).then(async () => {
    // Check if admin exists
    const admin = await db.User.findOne({ where: { email: 'joe@gmail.com' } });
    if (!admin) {
        const hashedPassword = await bcrypt.hash('Admin1234', 10);
        await db.User.create({
            id: 0,
            name: 'Joe',
            email: 'joe@gmail.com',
            password: hashedPassword,
            role: 'admin',
            link_code: 'ADMIN'
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



