const _ = require('lodash');
const sendMessage = require('./send_message');


const postMessage = async (message) => {
  let response;

  const number = _.random(1, 101);
  if (number >= 90) {
    response = 'nerr';
  } else {
    response = 'ye';
  }
  await sendMessage({response, group_id: message.group_id});
};

module.exports = postMessage;
