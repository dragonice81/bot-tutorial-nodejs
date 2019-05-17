const request = require('request-promise-native');
const logger = require('../logger');

export const sendMessage = async (botResponse, error?) => {
  const botID = error ? process.env.BOT_ID_TEST : botResponse.group_id;
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
