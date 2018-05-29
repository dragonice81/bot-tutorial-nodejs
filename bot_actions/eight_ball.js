const predict = require('eightball');
const sendMessage = require('./send_message');

const sendEightBallMsg = async (message) => {
    const response = predict();
    await sendMessage({response, group_id: message.group_id});
};

module.exports = sendEightBallMsg;
