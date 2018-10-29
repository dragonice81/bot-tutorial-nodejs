const request = require('request-promise-native');
const _ = require('lodash');
const logger = require('winston');
const sendToGroupmeImageService = require('./groupme_image_service');
const sendMessage = require('./send_message');

const startingDarbyPicIds = [1, 2, 3, 4, 5, 6];
let notSentDarbyPicIds = [1, 2, 3, 4, 5, 6];

const sendPictureOfDarby = async (message) => {
  if (!notSentDarbyPicIds.length) {
    notSentDarbyPicIds = startingDarbyPicIds;
  }
  const imageNumber = _.sample(notSentDarbyPicIds);
  _.pull(notSentDarbyPicIds, imageNumber);
  const filePath = `./images/darby/${imageNumber}.png`;
  const response = await sendToGroupmeImageService(filePath);
  const imageService = JSON.parse(response);
  await sendMessage({response: ' ', group_id: message.group_id, attachments: [{type: 'image', url: imageService.payload.url}]});
};

const sendGif = async (message) => {
  if (message.text.trim().toLowerCase() === '#bae') {
    await sendPictureOfDarby(message);
    return;
  }
  try {
    const parsedData = JSON.parse(await request.get(
      `https://api.giphy.com/v1/gifs/search?q=${message.text.split('#')[1].trim()}&api_key=dc6zaTOxFJmzC&rating=r&limit=25`
    ));
    if (parsedData && parsedData.data) {
      if (parsedData.data.length) {
        const giphyResponse = _.sample(parsedData.data);
        const botResponse = giphyResponse.images.downsized.url;
        await sendMessage({response: botResponse, group_id: message.group_id});
      } else {
        logger.warn(`No gifs for ${message.text}`);
        await sendGif({text: '#random', group_id: message.group_id});
      }
    } else {
      logger.warn(`No gifs for ${message.text}`);
      await sendGif({text: '#random', group_id: message.group_id});
    }
  } catch (e) {
    logger.error(e);
  }
};

module.exports = sendGif;
