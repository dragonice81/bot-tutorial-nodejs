const textMeme = require('text-meme');
const colorHelper = require('color-to-name');
const sendToGroupmeImageService = require('./groupme_image_service');
const sendMessage = require('./send_message');

const getColorCode = (colorName) => {
  const colors = colorHelper.getAllColors();
  let color;
  Object.keys(colors).forEach((hexCode) => {
    if (colors[hexCode] === colorName.toLowerCase()) {
      color = hexCode;
    }
  });
  return color || '#4f656d';
};

const makeTextMeme = (message, customColorFlag) => {
  let color = '#4f656d';
  const splitMessage = message.text.split(' ');
  let gifWords = '';
  let indexStart = 2;
  if (customColorFlag) {
    indexStart = 3;
    color = getColorCode(splitMessage[2].replace('-', ''));
  }
  for (let i = indexStart; i < splitMessage.length; i += 1) {
    gifWords += `${splitMessage[i]} `;
  }
  textMeme(gifWords, {delay: 350, filename: 'quote.gif', background: color}).then(async (filename) => {
    await setTimeout(async () => {
      const response = await sendToGroupmeImageService(filename);
      const imageService = JSON.parse(response);
      await sendMessage({response: ' ', group_id: message.group_id, attachments: [{type: 'image', url: imageService.payload.url}]});
    }, 500);
  });
};

module.exports = makeTextMeme;
