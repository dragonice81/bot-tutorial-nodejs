const HTTPS = require('https');
const nodeRequest = require('request');
const cool = require('cool-ascii-faces');
const fs = require('fs');
const jokes = require('./jokes');
const predict = require('eightball');
const Markov = require('markov-strings');

const messages = require('./messages');

const botID = process.env.BOT_ID;
const _ = require('lodash');

const options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
};

const members = {};
const apiKey = process.env.API_KEY;

function respond() {
    const request = JSON.parse(this.req.chunks[0]);
    const yeRegex = /^Ye\?|ye\?$/;
    const markovRegex = /@?[gG]((arrett)|(urt))[bB]ot,? talk to me/;
    const shadesRegex = /((50|[fF]ifty) [sS]hades [Oo]f [Gg]r[ea]y)/;
    const gifRegex = /#[0-9a-zA-Z ]+/;
    const leaderRegex = /-leaderboard/;
    const directionsRegex = /[dD]irections from[:]? ([0-9a-zA-Z .,]+) [tT]o[:]? ([0-9a-zA-Z .,]+)/;
    const jokeRegex = /@?[gG]((arrett)|(urt))[bB]ot,? tell me a joke/;
    const eightBallRegex = /@?[gG]((arrett)|(urt))[bB]ot,? [a-zA-Z0-9 ]+\?{1}/;
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/;
    console.log(request.text);
    if (request.text && urlRegex.test(request.text)) {
        console.log("don't care");
        this.res.writeHead(200);
        this.res.end();
    } else if (request.text && yeRegex.test(request.text)) {
        this.res.writeHead(200);
        postMessage();
        this.res.end();
    } else if (request.text && shadesRegex.test(request.text)) {
	  this.res.writeHead(200);
	  gifTag('hot garbage');
	  this.res.end();
    } else if (request.text && gifRegex.test(request.text)) {
        this.res.writeHead(200);
        console.log('gif requested');
        gifTag(request.text);
        this.res.end();
    } else if (request.text && jokeRegex.test(request.text)) {
        this.res.writeHead(200);
        console.log('telling a joke');
        tellJoke();
        this.res.end();
    } else if (request.text && eightBallRegex.test(request.text)) {
        this.res.writeHead(200);
        console.log('eight ball');
        sendEightBallMsg();
        this.res.end();
    } else if (request.text && leaderRegex.test(request.text)) {
        this.res.writeHead(200);
        // doLeaderboard();
        this.res.end();
    } else if (request.text && markovRegex.test(request.text)) {
        this.res.writeHead(200);
        createMarkovString();
        this.res.end();
    } else if (request.text && directionsRegex.test(request.text)) {
        this.res.writeHead(200);
        getDirections(request.text);
        this.res.end();

    } else {
        console.log("don't care");
        this.res.writeHead(200);
        this.res.end();
    }
}

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function postMessage() {
    let botResponse,
        body,
        botReq;

    botResponse = cool();

    const number = randomInt(1, 101);
    if (number >= 90) {
        botResponse = 'nerr';
    } else {
        botResponse = 'ye';
    }
    sendResponse(botResponse);
}

function sendResponse(botResponse) {
    console.log(`sending ${botResponse} to ${botID}`);

    const body = {
        bot_id: botID,
        text: botResponse
    };
    const botReq = HTTPS.request(options, (res) => {
        if (res.statusCode == 202) {
            // neat
        } else {
            console.log(`rejecting bad status code ${res.statusCode}`);
        }
    });

    botReq.on('error', (err) => {
        console.log(`error posting message ${JSON.stringify(err)}`);
    });
    botReq.on('timeout', (err) => {
        console.log(`timeout posting message ${JSON.stringify(err)}`);
    });
    botReq.end(JSON.stringify(body));
}

function sendEightBallMsg() {
    sendResponse(predict());
}


function tellJoke() {
    const randomInt = _.random(496);
    if (randomInt < 86) {
        const joke = _.sample(jokes);
        sendResponse(joke);
    } else {
        nodeRequest({url: 'https://icanhazdadjoke.com/', headers: {Accept: 'application/json'}}, (error, response, body) => {
            parsedData = JSON.parse(body);
            if (parsedData.joke) {
                sendResponse(parsedData.joke);
            } else {
                const joke = _.sample(jokes);
                sendResponse(joke);
            }
        });
    }
}


function gifTag(message) {
    nodeRequest(`https://api.giphy.com/v1/gifs/search?q=${message.split('#')[1].trim()}&api_key=dc6zaTOxFJmzC&rating=r&limit=25`, (error, response, body) => {
        const parsedData = JSON.parse(body);
        console.log(`split msg: ${message.split('#')[1].trim()}`);
        if (!error && response.statusCode === 200 && parsedData && parsedData.data) {
            if (parsedData.data.length) {
                const giphyResponse = _.sample(parsedData.data);
                const botResponse = giphyResponse.images.downsized.url;
                sendResponse(botResponse);
            } else {
                gifTag('#random');
            }
        } else {
            console.log(`${message} is invalid`);
        }
    });
}

function doLeaderboard() {
    const members = {};
    const leaderboard = {};
    let messages = [];
    nodeRequest(`https://api.groupme.com/v3/groups/21255858?token=${apiKey}`, (error, response, body) => {
        const parsedData = JSON.parse(body);
        if (!error && response.statusCode == 200 && parsedData && parsedData.response) {
            for (let i = 0; i < parsedData.response.members.length; i++) {
                members[parsedData.response.members[i].user_id] = parsedData.response.members[i].nickname;
                leaderboard[parsedData.response.members[i].nickname] = {likes: 0, likesGivenOut: 0};
                leaderboard.GarrettBot = {likes: 0, likesGivenOut: 0};
            }
        }
        nodeRequest(`https://api.groupme.com/v3/groups/21255858/likes?period=month&token=${apiKey}`, (error, response, body) => {
            const parsedData = JSON.parse(body);
            if (!error && response.statusCode == 200 && parsedData && parsedData.response) {
                messages = parsedData.response.messages;
                // console.log(parsedData.response);
            }
            for (let j = 0; j < messages.length; j++) {
                message = messages[j];
                // console.log(message);
                leaderboard[message.name].likes += message.favorited_by.length;
                for (let i = 0; i < message.favorited_by.length; i++) {
                    leaderboard[members[message.favorited_by[i]]].likesGivenOut++;
                }
            }

            console.log(leaderboard);
            generateLeaderBoardResponse(leaderboard);
        });
    });
}
function generateLeaderBoardResponse(leaderboard) {
    let botResponse = 'Leaderboard:\n';
    for (let i = 0; i < Object.keys(leaderboard).length; i++) {
        botResponse += `${Object.keys(leaderboard)[i]}:\n`;
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
    nodeRequest(googleUrl, (error, response, body) => {
        const jsonResponse = JSON.parse(body);
        const urlShortenerUrl = `https://www.googleapis.com/urlshortener/v1/url?key=${process.env.URL_SHORT_KEY}`;
        const googleMapsUri = `https://www.google.com/maps/dir/${beginningLocString}/${destLocString}`;
        nodeRequest.post(urlShortenerUrl, {json: {longUrl: googleMapsUri}}, (response, body) => {
            const shortUrl = body.body.id;
            const botResponse =
      `Directions to ${destLocString.replace(/[+]/g, ' ')} from ${beginningLocString.replace(/[+]/g, ' ')}

It will take ${jsonResponse.routes[0].legs[0].duration.text} to travel ${jsonResponse.routes[0].legs[0].distance.text}

Click this to start navigation: ${shortUrl}`;
            sendResponse(botResponse);
        });
    });
}

function createMarkovString() {
    score = _.random(100);
    const options = {
        maxLength: 140,
        minWords: 7,
        minScorePerWord: score
    };
    const markov = new Markov(messages, options);
    markov.buildCorpusSync();
    const result = markov.generateSentenceSync();
    console.log(`minScore: ${score}`);
    sendResponse(result.string);
}

// async function scrape() {
//     const url = 'https://api.groupme.com/v3/groups/messages?limit=100&token=';
//     const messages = [];
//     const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/;
//     const leaderRegex = /Leaderboard/;
//     const garrettRegex = /@garrettbot/;
//     // nodeRequest(url, (e, res, body) => {
//     //     const response = JSON.parse(body).response
//     //     for (let i = 0; i < response.messages.length; i++) {
//     //         if (response.messages[i].text) {
//     //             messages.push(response.messages[i].text);
//     //         }
//     //     }
//     //     // for (let i = 0; i < rea)

//     // });
//     let lastMessageId = '';
//     while(messages.length < 9800) {
//         console.log('delaying');
//         await delay(5000);
//         console.log('finished delay');
//         let response = await requestPro(`${url}${lastMessageId}`);
//         response = JSON.parse(response).response;
//         lastMessageId = `&before_id=${response.messages[99].id}`;
//         for (let i = 0; i < response.messages.length; i++) {
//             if (response.messages[i].text && !urlRegex.test(response.messages[i].text) && !leaderRegex.test(response.messages[i].text) && !garrettRegex.test(response.messages[i].text)) {
//                 messages.push(response.messages[i].text);
//             }
//         }
//         console.log(`current dict size: ${messages.length}`);    
    
//     }
//     fs.writeFileSync('messages.json', JSON.stringify(messages));
//     console.log(messages.length);    


// }


module.exports = {
    respond
}
