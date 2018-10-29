const Markov = require('markov-strings');
const _ = require('lodash');
const messages = require('../messages');
const sendMessage = require('./send_message');

const createMarkovString = async (message) => {
  const score = _.random(100);
  const markovOptions = {
    maxLength: 140,
    minWords: 7,
    minScore: score
  };
  const markov = new Markov(messages, markovOptions);
  await markov.buildCorpus();
  const result = await markov.generateSentence();
  await sendMessage({response: result.string, group_id: message.group_id});
};

module.exports = {
  createMarkovString
};
