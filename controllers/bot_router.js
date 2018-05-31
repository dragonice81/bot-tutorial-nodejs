const markovController = require('../bot_actions/markov');
const sendGif = require('../bot_actions/gif');
const directions = require('../bot_actions/directions');
const tellJoke = require('../bot_actions/joke');
const sendEightBallMsg = require('../bot_actions/eight_ball');
const sendVideo = require('../bot_actions/video');
const sendComplimentOrInsult = require('../bot_actions/compliment_insult');
const sendMessage = require('../bot_actions/send_message');
const getWeather = require('../bot_actions/weather');
const makeTextMeme = require('../bot_actions/text_meme');
const findRestaurant = require('../bot_actions/restaurant');
const yeOrNerr = require('../bot_actions/yeOrNerr');
const _ = require('lodash');
const logger = require('winston');

const phraseMap = new Map([
    [/^Ye\?|ye\?$/, async message => yeOrNerr(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? talk to me/, async message => markovController.createMarkovString(message)],
    [/((50|[fF]ifty) [sS]hades [Oo]f [Gg]r[ea]y)/, async message => sendGif({text: 'hot garbage', group_id: message.group_id})],
    [/#[0-9a-zA-Z ]+/, async message => sendGif(message)],
    [/[dD]irections from[:]? ([0-9a-zA-Z .,]+) [tT]o[:]? ([0-9a-zA-Z .,]+)/, async message => directions(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? tell me a joke/, async message => tellJoke(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? joke/, async message => tellJoke(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? [a-zA-Z0-9 ]+\?{1}/, async message => sendEightBallMsg(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? give me a song/, async message => sendVideo(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? song/, async message => sendVideo(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? ((compliment)|(insult)) [a-zA-Z]+/, async message => sendComplimentOrInsult(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? ((tell)|(send)) [a-zA-Z]+ an? ((compliment)|(insult))/, async message => sendComplimentOrInsult(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? random number/, async message => sendMessage({response: `${_.random(100)}`, group_id: message.group_id})],
    [/@?[gG]((arrett)|(urt))[bB]ot,? weather in ([0-9a-zA-Z .,]+)/, async message => getWeather(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? gif ([0-9a-zA-Z .,]+)/, async message => makeTextMeme(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? gif -[a-zA-Z]+ ([0-9a-zA-Z .,]+)/, async message => makeTextMeme(message, true)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? (([a-zA-Z ]+) restaurant in ([0-9a-zA-Z .,]+))|(find me a ([a-zA-Z ]+) restaurant in ([0-9a-zA-Z .,]+))/,
        async message => findRestaurant(message)]
]);


const respond = () => async (req, res) => {
    const message = req.body;
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
    if (!message.text || message.name.toLowerCase() === 'garrettbot' || (message.text && urlRegex.test(message.text))) {
        logger.info("don't care");
        res.send('didn\'t do anything');
        return;
    }
    phraseMap.forEach(async (func, regEx) => {
        try {
            if (regEx.test(message.text)) {
                await func(message);
                res.send(message.text);
                return;
            }
        } catch (e) {
            logger.error(e.message);
            await sendMessage({response: e.message}, true);
            res.status(400);
            res.send(e.message);
        }
    });
};

module.exports = {
    respond
};
