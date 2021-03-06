/* eslint no-restricted-syntax: 0 */
/* eslint no-await-in-loop: 0 */

const config = require('config');

const permissions = config.get('SpotifyPermissions');

const _ = require('lodash');
const nostra = require('nostra');
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
const portmanteau = require('../bot_actions/portmanteau');
const logger = require('../logger');
const music = require('../bot_actions/music_helper');
const urbanDictionary = require('../bot_actions/urban_dictionary');

const changePermissions = async (message, flag) => {
  const userId = message.user_id;
  const requestPermission = permissions.filter(p => p.user_id === userId);
  if (!requestPermission[0].admin) {
    return;
  }
  const messageArray = message.text.split(' ');
  let name = '';
  for (let i = 4; i < messageArray.length; i += 1) {
    name += `${messageArray[i].toLowerCase()} `;
  }
  name = name.trim();
  for (let j = 1; j < permissions.length; j += 1) {
    if (permissions[j].name.includes(name)) {
      permissions[j].canSpotify = flag;
      break;
    }
  }
  await sendMessage({response: `Set Spotify permissions for ${name} to ${flag}`, group_id: process.env.BOT_ID_TEST});
};

const changeGlobalPermissions = async (message, flag) => {
  const userId = message.user_id;
  const requestPermission = permissions.filter(p => p.user_id === userId);
  if (!requestPermission[0].admin) {
    return;
  }
  permissions[0].IsEnabled = flag;
  await sendMessage({response: `Set global Spotify permissions to ${flag}`, group_id: process.env.BOT_ID_TEST});
};


const phraseMap = new Map([
  [/^Ye\?|ye\?$/, async message => yeOrNerr(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? disable spotify for ([a-zA-Z ]+)/, async message => changePermissions(message, false)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? enable spotify for ([a-zA-Z ]+)/, async message => changePermissions(message, true)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? disable spotify/, async message => changeGlobalPermissions(message, false)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? enable spotify/, async message => changeGlobalPermissions(message, true)],
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
    async message => findRestaurant(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? fortune/, async message => sendMessage({response: nostra.generate(), group_id: message.group_id})],
  [/@?[gG]((arrett)|(urt))[bB]ot,? play ([0-9a-zA-Z .,]+)/, async message => music.fetchMusic(message, permissions)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? define ([0-9a-zA-Z ]+)/, async message => urbanDictionary.define(message)],
  [/[a-zA-Z]+ [a-zA-Z]+/, async message => portmanteau.makepm(message)]
]);


const respond = () => async (req, res) => {
  const message = req.body;
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
  if (!message.text || message.name.toLowerCase() === 'garrettbot' || (message.text && urlRegex.test(message.text))) {
    logger.info(`Received message that isn't a command: ${message.text ? message.text : ''}`);
    res.send('didn\'t do anything');
    return;
  }
  let responseText = '';
  let status = 200;
  for (const [regEx, func] of phraseMap) {
    try {
      if (regEx.test(message.text)) {
        await func(message);
        responseText = message.text;
        break;
      }
    } catch (e) {
      logger.error(e.message);
      await sendMessage({response: e.message}, true);
      status = 400;
      responseText = e.message;
    }
  }
  res.status(status);
  res.send(responseText);
};

module.exports = {
  respond
};
