let jokes = require('../jokes.json');
const _ = require('lodash');
const sendMessage = require('./send_message');
const logger = require('winston');

let saidJokes = [];


const tellJoke = async (message) => {
    if (jokes.length === 0) {
        logger.info('no jokes found');
        for (let i = 0; i < saidJokes.length; i += 1) {
            saidJokes[i].said = true;
        }
        jokes = saidJokes;
        saidJokes = [];
    }
    const joke = _.sample(jokes);
    const index = _.indexOf(jokes, joke);
    _.pullAt(jokes, index);
    joke.said = true;
    saidJokes.push(jokes);
    await sendMessage({response: joke.joke, group_id: message.group_id});
};

module.exports = tellJoke;
