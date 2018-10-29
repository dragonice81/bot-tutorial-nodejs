const request = require('request-promise-native');
const _ = require('lodash');
const sendMessage = require('./send_message');

const findRestaurant = async (message) => {
  const messageArray = message.text.split(' ');
  let restaurantType = '';
  let location = '';
  let locationIndex = 0;
  const ignoreStrings = ['find', 'me', 'a', 'restaurant'];
  for (let i = 1; i < messageArray.length; i += 1) {
    if (messageArray[i] === 'restaurant') {
      locationIndex = i + 2;
      break;
    }
    if (!ignoreStrings.includes(messageArray[i])) {
      restaurantType += `${messageArray[i]} `;
    }
  }
  while (locationIndex < messageArray.length) {
    location += `${messageArray[locationIndex]} `;
    locationIndex += 1;
  }
  const queryString = encodeURI((`${restaurantType}restaurants in ${location}`).trim());
  const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${queryString}&key=${process.env.MAP_KEY}`;
  let response;
  try {
    response = JSON.parse(await request.get(googleUrl));
  } catch (e) {
    throw new Error(`Restaurant Error ${e}`);
  }
  if (!response.results || response.results.length === 0) {
    await sendMessage({response: 'No results found 😞', group_id: message.group_id});
  }
  const results = _.slice(_.orderBy(response.results, ['rating'], ['desc']), 0, 10);
  const selectedResult = _.sample(results);
  const restaurantName = selectedResult.name;
  const restaurantLocation = selectedResult.geometry.location;
  const restaurantAddress = selectedResult.formatted_address;
  await sendMessage({
    response: restaurantAddress,
    group_id: message.group_id,
    attachments: [{
      type: 'location', name: restaurantName, lat: restaurantLocation.lat, lng: restaurantLocation.lng
    }]
  });
};

module.exports = findRestaurant;
