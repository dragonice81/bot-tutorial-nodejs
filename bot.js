var HTTPS = require('https');
var request = require('request');
var cool = require('cool-ascii-faces');

var botID = process.env.BOT_ID;
var _ = require('lodash');

var options = {
  hostname: 'api.groupme.com',
  path: '/v3/bots/post',
  method: 'POST'
};


function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      yeRegex = /^Ye\?|ye\?$/,
      gifRegex = /#[a-zA-Z ]+/,
      leaderRegex = /-leaderboard/;

  if(request.text && yeRegex.test(request.text)) {
    this.res.writeHead(200);
    postMessage();
    this.res.end();
  } else if (request.text && gifRegex.test(request.text)) {
    console.log('ye');
    this.res.writeHead(200);
    gifTag(request.text);
    this.res.end();
  } else {
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

}

exports.respond = respond;