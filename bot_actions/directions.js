const request = require('request-promise-native');
const sendMessage = require('./send_message');


const arrayToURLParam = (locationArray) => {
  let urlParamString = '';
  for (let i = 0; i < locationArray.length; i += 1) {
    urlParamString += locationArray[i];
    if (i < locationArray.length - 1) {
      urlParamString += '+';
    }
  }
  return urlParamString;
};

const getDirections = async (message) => {
  const directionString = message.text;
  const directionStringArray = directionString.split(' ');
  directionStringArray.shift();
  directionStringArray.shift();
  const beginningArray = [];
  let destinationArray = [];
  while (directionStringArray[0].replace(':', '') !== 'to') {
    beginningArray.push(directionStringArray.shift());
  }
  directionStringArray.shift();
  destinationArray = directionStringArray;
  const beginningLocString = arrayToURLParam(beginningArray);
  const destLocString = arrayToURLParam(destinationArray);
  const googleUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${beginningLocString}&destination=${destLocString}&key=${process.env.MAP_KEY}`;
  const response = JSON.parse(await request.get(googleUrl));
  const urlShortenerUrl = `https://www.googleapis.com/urlshortener/v1/url?key=${process.env.URL_SHORT_KEY}`;
  const googleMapsUri = `https://www.google.com/maps/dir/${beginningLocString}/${destLocString}`;
  const shortenerResponse = await request.post(urlShortenerUrl, {json: {longUrl: googleMapsUri}});
  const shortUrl = shortenerResponse.id;
  const botResponse = `Directions to ${destLocString.replace(/[+]/g, ' ')} from ${beginningLocString.replace(/[+]/g, ' ')}

It will take ${response.routes[0].legs[0].duration.text} to travel ${response.routes[0].legs[0].distance.text}

Click this to start navigation: ${shortUrl}`;
  await sendMessage({response: botResponse, group_id: message.group_id});
};

module.exports = getDirections;
