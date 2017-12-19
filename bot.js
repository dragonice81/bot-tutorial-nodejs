
var HTTPS = require('https');
var request = require('request');
var cool = require('cool-ascii-faces');
var fs = require('fs');

var botID = process.env.BOT_ID;
botID = '678c500d5d216e077e520322bc';
var _ = require('lodash');

var options = {
  hostname: 'api.groupme.com',
  path: '/v3/bots/post',
  method: 'POST'
};

var members = {};
var apiKey = process.env.API_KEY;

var messages = [];


function respond() {
  var request = JSON.parse(this.req.chunks[0]),
  // var request = {text: '-leaderboard'},  
      yeRegex = /^Ye\?|ye\?$/,
      gifRegex = /#[a-zA-Z ]+/,
      leaderRegex = /-leaderboard/;
      directionsRegex = /[dD]irections from[:]? ([0-9a-zA-Z .,]+) [tT]o[:]? ([0-9a-zA-Z .,]+)/;

  if (request.text && yeRegex.test(request.text)) {
    this.res.writeHead(200);
    postMessage();
    this.res.end();
  }
  else if (request.text && gifRegex.test(request.text)) {
    this.res.writeHead(200);
    gifTag(request.text);
    this.res.end();
  }
  else if (request.text && leaderRegex.test(request.text)) {
    this.res.writeHead(200);
    doLeaderboard();
    this.res.end();
  }
  else if (request.text && directionsRegex.test(request.text)) {
    this.res.writeHead(200);
    getDirections(request.text);
    this.res.end();
  }
  else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function postMessage() {
  var botResponse, body, botReq;

  botResponse = cool();

  var number = randomInt(1,101);
  if (number >= 90) {
    botResponse = 'nerr';
  }
  else {
    botResponse = 'ye';
  }
  sendResponse(botResponse);
}

function sendResponse(botResponse) {
  console.log('sending ' + botResponse + ' to ' + botID);
  
  var body = {
    "bot_id" : botID,
    "text" : botResponse
  };
  var botReq;
  botReq = HTTPS.request(options, function(res) {
    if(res.statusCode == 202) {
      //neat
    } else {
      console.log('rejecting bad status code ' + res.statusCode);
    }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));


}


function gifTag(message) {

  request('https://api.giphy.com/v1/gifs/search?q=' + message.substring(1).trim() + '&api_key=dc6zaTOxFJmzC&rating=r&limit=25', function (error, response, body) {
    parsedData = JSON.parse(body);
    
    if (!error && response.statusCode == 200 && parsedData && parsedData.data) {
      var giphyResponse = _.shuffle(parsedData.data);
      var botResponse = giphyResponse[0].images.downsized.url;
      sendResponse(botResponse);    
    } else {
      console.log(message + ' is invalid');
    }
  });
}

function doLeaderboard() {
  var members = {};
  var leaderboard = {};
  var messages = [];
  request('https://api.groupme.com/v3/groups/21255858?token=' + apiKey, function (error, response, body) {
    var parsedData = JSON.parse(body);
    if (!error && response.statusCode == 200 && parsedData && parsedData.response) {
      for (var i = 0; i < parsedData.response.members.length; i++) {
        members[parsedData.response.members[i].user_id] = parsedData.response.members[i].nickname;
        leaderboard[parsedData.response.members[i].nickname] = {likes: 0, likesGivenOut: 0};
        leaderboard['GarrettBot'] = {likes: 0, likesGivenOut: 0};
      }
    }
    request('https://api.groupme.com/v3/groups/21255858/likes?period=month&token=' + apiKey, function (error, response, body) {
      var parsedData = JSON.parse(body);
      if (!error && response.statusCode == 200 && parsedData && parsedData.response) {
        messages = parsedData.response.messages;
        // console.log(parsedData.response);
        
      }
      for (var j = 0; j < messages.length; j++) {
        message = messages[j];
        // console.log(message);
        leaderboard[message.name].likes += message.favorited_by.length;
        for (var i = 0; i < message.favorited_by.length; i++) {
          leaderboard[members[message.favorited_by[i]]].likesGivenOut++;
        }
    
      }

      console.log(leaderboard);
      generateLeaderBoardResponse(leaderboard);
  

    });
  

  });
  
}
function generateLeaderBoardResponse(leaderboard) {
  var botResponse = 'Leaderboard:\n';
  for (var i = 0; i < Object.keys(leaderboard).length; i++) {
    botResponse += Object.keys(leaderboard)[i] + ':\n';
    botResponse += `  Likes: ${leaderboard[Object.keys(leaderboard)[i]].likes}\n`;
    botResponse += `  Likes given: ${leaderboard[Object.keys(leaderboard)[i]].likesGivenOut}\n`;
  }
  sendResponse(botResponse);
}

function arrayToURLParam(locationArray) {
  let urlParamString = '';
  for (let i = 0; i < locationArray.length; i++) {
    urlParamString += locationArray[i];
    if (i < locationArray.length - 1) {
      urlParamString += '+';
    }
  }
  return urlParamString;
}

function getDirections(directionString) {
  var directionStringArray = directionString.split(' ');
  directionStringArray.shift();
  directionStringArray.shift();
  var beginningArray = [];
  var destinationArray = [];
  while (directionStringArray[0].replace(':', '') !== 'to') {
    beginningArray.push(directionStringArray.shift());
  }
  directionStringArray.shift();
  destinationArray = directionStringArray;
  const beginningLocString = arrayToURLParam(beginningArray);
  const destLocString = arrayToURLParam(destinationArray);
  const googleUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${beginningLocString}&destination=${destLocString}&key=${process.env.MAP_KEY}`;
  request(googleUrl, function (error, response, body) {
	  console.log(body);
    let jsonResponse = JSON.parse(response.body);
    const urlShortenerUrl = `https://www.googleapis.com/urlshortener/v1/url?key=${process.env.URL_SHORT_KEY}`;
    const googleMapsUri = `https://www.google.com/maps/dir/${beginningLocString}/${destLocString}`;
    request.post(urlShortenerUrl, {json: {longUrl: googleMapsUri}}, (response, body) => {
      const shortUrl = body.body.id;
      let botResponse =
      `Directions from: ${beginningLocString.replace(/[+]/g, ' ')} to: ${destLocString.replace(/[+]/g, ' ')}

It will take ${jsonResponse.routes[0].legs[0].duration.text} to travel ${jsonResponse.routes[0].legs[0].distance.text}

Click this to start navigation: ${shortUrl}`;    
      sendResponse(botResponse);
  
    });
  });
}

exports.respond = respond;