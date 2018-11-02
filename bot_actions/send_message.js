const request = require('request-promise-native');
const logger = require('../logger');

const getBotId = (groupId) => {
  if (+groupId === 21255858) {
    return process.env.BROM_BOT_ID;
  } if (+groupId === 39437389) {
    return process.env.AMERICA_BOT_ID;
  } if (+groupId === 40632517) {
    return process.env.WORK_BOT_ID;
  }
  return undefined;
};

const sendMessage = async (botResponse, error) => {
  const messageBotId = getBotId(botResponse.group_id);
  const botID = error || !messageBotId ? process.env.BOT_ID_TEST : messageBotId;
  logger.info(`sending ${botResponse.response} to ${botID}`);
  const attachments = botResponse.attachments || [];
  const body = {
    bot_id: botID,
    text: botResponse.response,
    attachments
  };
  await setTimeout(() => { logger.info('waiting'); }, 50);
  await request.post('https://api.groupme.com/v3/bots/post/', {body: JSON.stringify(body)});
};

module.exports = sendMessage;
