import config from 'config';


import _ from 'lodash';
import nostra from 'nostra';
import * as botActions from '../bot_actions';
import {SpotifyPermissions, GroupMeMessage} from '../models';
import { logger } from 'logger';

const permissions = config.get<SpotifyPermissions>('SpotifyPermissions');



const changePermissions = async (message, flag) => {
  const userId = message.user_id;
  const requestPermission = permissions.users.filter(p => p.user_id === userId);
  if (!requestPermission[0].admin) {
    return;
  }
  const messageArray = message.text.split(' ');
  let name = '';
  for (let i = 4; i < messageArray.length; i += 1) {
    name += `${messageArray[i].toLowerCase()} `;
  }
  name = name.trim();
  for (let j = 1; j < permissions.users.length; j += 1) {
    if (permissions[j].name.includes(name)) {
      permissions[j].canSpotify = flag;
      break;
    }
  }
  await botActions.sendMessage({response: `Set Spotify permissions for ${name} to ${flag}`, group_id: process.env.BOT_ID_TEST});
};

const changeGlobalPermissions = async (message, flag) => {
  const userId = message.user_id;
  const requestPermission = permissions.users.filter(p => p.user_id === userId);
  if (!requestPermission[0].admin) {
    return;
  }
  permissions.global = flag;
  await botActions.sendMessage({response: `Set global Spotify permissions to ${flag}`, group_id: process.env.BOT_ID_TEST});
};

const phraseMap = new Map([
  [/^Ye\?|ye\?$/, async message => botActions.yeOrNerr(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? disable spotify for ([a-zA-Z ]+)/, async message => changePermissions(message, false)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? enable spotify for ([a-zA-Z ]+)/, async message => changePermissions(message, true)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? disable spotify/, async message => changeGlobalPermissions(message, false)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? enable spotify/, async message => changeGlobalPermissions(message, true)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? talk to me/, async message => botActions.createMarkovString(message)],
  [/((50|[fF]ifty) [sS]hades [Oo]f [Gg]r[ea]y)/, async message => botActions.sendGif({text: 'hot garbage', group_id: message.group_id, name: message.name, user_id: message.userId})],
  [/#[0-9a-zA-Z ]+/, async message => botActions.sendGif(message)],
  [/[dD]irections from[:]? ([0-9a-zA-Z .,]+) [tT]o[:]? ([0-9a-zA-Z .,]+)/, async message => botActions.getDirections(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? tell me a joke/, async message => botActions.tellJoke(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? joke/, async message => botActions.tellJoke(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? [a-zA-Z0-9 ]+\?{1}/, async message => botActions.sendEightBallMsg(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? give me a song/, async message => botActions.sendVideo(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? song/, async message => botActions.sendVideo(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? ((compliment)|(insult)) [a-zA-Z]+/, async message => botActions.sendComplimentOrInsult(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? ((tell)|(send)) [a-zA-Z]+ an? ((compliment)|(insult))/, async message => botActions.sendComplimentOrInsult(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? random number/, async message => botActions.sendMessage({response: `${_.random(100)}`, group_id: message.group_id})],
  [/@?[gG]((arrett)|(urt))[bB]ot,? weather in ([0-9a-zA-Z .,]+)/, async message => botActions.getWeather(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? gif ([0-9a-zA-Z .,]+)/, async message => botActions.makeTextMeme(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? gif -[a-zA-Z]+ ([0-9a-zA-Z .,]+)/, async message => botActions.makeTextMeme(message, true)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? (([a-zA-Z ]+) restaurant in ([0-9a-zA-Z .,]+))|(find me a ([a-zA-Z ]+) restaurant in ([0-9a-zA-Z .,]+))/,
    async message => botActions.findRestaurant(message)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? fortune/, async message => botActions.sendMessage({response: nostra.generate(), group_id: message.group_id})],
  [/@?[gG]((arrett)|(urt))[bB]ot,? play ([0-9a-zA-Z .,]+)/, async message => botActions.fetchMusic(message, permissions)],
  [/@?[gG]((arrett)|(urt))[bB]ot,? define ([0-9a-zA-Z ]+)/, async message => botActions.define(message)],
  [/[a-zA-Z]+ [a-zA-Z]+/, async message => botActions.makepm(message)]
]);


export const respond = () => async (req, res) => {
  const message = req.body as GroupMeMessage;
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
      await botActions.sendMessage({response: e.message}, true);
      status = 400;
      responseText = e.message;
    }
  }
  res.status(status);
  res.send(responseText);
};
