var HTTPS = require('https');
var cool = require('cool-ascii-faces');

var botID = process.env.BOT_ID;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      yeRegex = /^Ye\?|ye\?$/,
      gifRegex = /@garrettbot #[a-zA-Z ]+/;

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
  var botResponse, options, body, botReq;

  botResponse = cool();

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };
  var number = randomInt(1,101);
  if (number >= 90) {
    botResponse = 'nerr';
  }
  else {
    botResponse = 'ye';
  }
  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

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

  request('https://api.giphy.com/v1/gifs/translate?s=' + message.substring(13).trim() + '&api_key=dc6zaTOxFJmzC&rating=r', function (error, response, body) {
  parsedData = JSON.parse(body);
  
  if (!error && response.statusCode == 200 && parsedData && parsedData.data.images) {
    var botResponse = parsedData.data.images.downsized.url;
    
    var options = {
      hostname: 'api.groupme.com',
      path: '/v3/bots/post',
      method: 'POST'
    };
    var body = {
      "bot_id" : botID,
      "text" : botResponse
    };
    console.log('sending ' + botResponse + ' to ' + botID);
    
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
    
  
  
  } else {
  console.log(message + ' is invalid');
  }
  });
}

exports.respond = respond;