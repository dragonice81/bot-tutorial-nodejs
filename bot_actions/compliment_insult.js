const _ = require('lodash');
const users = require('../users.json');
const compliments = require('../compliments.json');
const insults = require('../insults.json');
const sendMessage = require('./send_message');


const extractNameFromMessage = (message) => {
  const splitMessage = message.text.toLowerCase().split(' ');
  for (let i = 0; i < users.length; i += 1) {
    if (splitMessage.includes(users[i].toLowerCase())) {
      if (users[i] === 'Me') {
        return `@${message.name}, `;
      }
      return `@${users[i]}, `;
    }
  }
  let nameFlag = false;
  let name = '';
  for (let i = 0; i < splitMessage.length; i += 1) {
    if (nameFlag) {
      name += `${splitMessage[i]} `;
    }
    if (splitMessage[i] === 'compliment' || splitMessage[i] === 'insult') {
      nameFlag = true;
    }
  }
  if (!name) {
    return '';
  }
  name = name.trim();
  return `@${name} `;
};

const sendComplimentOrInsult = async (message) => {
  const complimentflag = message.text.toLowerCase().includes('compliment');
  const name = extractNameFromMessage(message);
  let response;
  if (complimentflag) {
    response = `${name}${_.sample(compliments)}`;
  } else {
    response = `${name}${_.sample(insults)}`;
  }
  await sendMessage({response, group_id: message.group_id});
};

module.exports = sendComplimentOrInsult;
