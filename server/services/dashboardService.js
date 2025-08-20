const { Alert } = require('../models');

async function sendDashBoard({ title, message, sendDate, endDate, userId }) {
    return await Alert.create({ title, message, sendDate, endDate, userId });
}

module.exports = { sendDashBoard };