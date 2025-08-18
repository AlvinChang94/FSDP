const { verify } = require('jsonwebtoken');
require('dotenv').config();
const validateToken = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return res.status(200).json({ error: 'Authorization header missing' });
        }

        const accessToken = authHeader.split(" ")[1];
        if (!accessToken) {
            return res.status(200).json({ error: 'Access token missing' });
        }
        const payload = verify(accessToken, process.env.APP_SECRET);
        req.user = payload;
        req.userId = payload.userId || payload.id;
        return next();

    }
    catch (err) {
        return res.sendStatus(200);
    }
}
module.exports = { validateToken };