const HTTPS = require('https');
const nodeRequest = require('request');
const cool = require('cool-ascii-faces');
const jokes = require('./jokes');
const predict = require('eightball');
const Markov = require('markov-strings');
const messages = require('./messages');
const _ = require('lodash');
const wrap = require('./middleware/error-catcher');

const mainBotID = process.env.BOT_ID;


const sendResponse = async (botResponse, error) => {
    // const botID = error ? process.env.BOT_ID_TEST : mainBotID;
    const botID = '678c500d5d216e077e520322bc';
    console.log(`sending ${botResponse} to ${botID}`);
    const body = {
        bot_id: botID,
        text: botResponse
    };
    await nodeRequest.post('https://api.groupme.com/v3/bots/post/', {body: JSON.stringify(body)});
};

const postMessage = () => {
    let botResponse;

    botResponse = cool();

    const number = _.random(1, 101);
    if (number >= 90) {
        botResponse = 'nerr';
    } else {
        botResponse = 'ye';
    }
    sendResponse(botResponse);
};

const sendEightBallMsg = async () => {
    await sendResponse(predict());
};


const tellJoke = async () => {
    if (_.filter((jokes, ['said', false])).length === 0) {
        console.log('no jokes found');
        for (let i = 0; i < jokes.length; i += 1) {
            jokes[i].said = false;
        }
    }
    const joke = _.sample(_.filter(jokes, ['said', false]));
    jokes[_.findIndex(jokes, joke)].said = true;
    await sendResponse(joke.joke);
};

const gifTag = async (message) => {
    // try {
        const parsedData = await nodeRequest.get(`https://api.giphy.com/v1/gifs/search?q=${message.split('#')[1].trim()}&api_key=dc6zaTOxFJmzC&rating=r&limit=25`);
        console.log(`split msg: ${message.split('#')[1].trim()}`);
        console.log(parsedData);
        if (parsedData && parsedData.data) {
            if (parsedData.data.length) {
                const giphyResponse = _.sample(parsedData.data);
                const botResponse = giphyResponse.images.downsized.url;
                await sendResponse(botResponse);
            } else {
                console.log(parsedData);
            }
        } else {
            console.log(`${message} is invalid`);
            // await gifTag('#random');
        }
    // } catch (e) {
    //     console.log(`${message} is invalid`);
    //     await gifTag('#random');
    // }
};

// function doLeaderboard() {
//     const members = {};
//     const leaderboard = {};
//     let messages = [];
//     nodeRequest(`https://api.groupme.com/v3/groups/21255858?token=${apiKey}`, (error, response, body) => {
//         const parsedData = JSON.parse(body);
//         if (!error && response.statusCode == 200 && parsedData && parsedData.response) {
//             for (let i = 0; i < parsedData.response.members.length; i++) {
//                 members[parsedData.response.members[i].user_id] = parsedData.response.members[i].nickname;
//                 leaderboard[parsedData.response.members[i].nickname] = {likes: 0, likesGivenOut: 0};
//                 leaderboard.GarrettBot = {likes: 0, likesGivenOut: 0};
//             }
//         }
//         nodeRequest(`https://api.groupme.com/v3/groups/21255858/likes?period=month&token=${apiKey}`, (error, response, body) => {
//             const parsedData = JSON.parse(body);
//             if (!error && response.statusCode == 200 && parsedData && parsedData.response) {
//                 messages = parsedData.response.messages;
//                 // console.log(parsedData.response);
//             }
//             for (let j = 0; j < messages.length; j++) {
//                 message = messages[j];
//                 // console.log(message);
//                 leaderboard[message.name].likes += message.favorited_by.length;
//                 for (let i = 0; i < message.favorited_by.length; i++) {
//                     leaderboard[members[message.favorited_by[i]]].likesGivenOut++;
//                 }
//             }

//             console.log(leaderboard);
//             generateLeaderBoardResponse(leaderboard);
//         });
//     });
// }
// function generateLeaderBoardResponse(leaderboard) {
//     let botResponse = 'Leaderboard:\n';
//     for (let i = 0; i < Object.keys(leaderboard).length; i++) {
//         botResponse += `${Object.keys(leaderboard)[i]}:\n`;
//         botResponse += `  Likes: ${leaderboard[Object.keys(leaderboard)[i]].likes}\n`;
//         botResponse += `  Likes given: ${leaderboard[Object.keys(leaderboard)[i]].likesGivenOut}\n`;
//     }
//     sendResponse(botResponse);
// }

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

const getDirections = (directionString) => {
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
};

const createMarkovString = () => {
    const score = _.random(100);
    const markovOptions = {
        maxLength: 140,
        minWords: 7,
        minScore: score
    };
    const markov = new Markov(messages, markovOptions);
    markov.buildCorpusSync();
    const result = markov.generateSentenceSync();
    console.log(`minScore: ${score}`);
    sendResponse(result.string);
};

const respond = () => wrap(async (req, res) => {
    console.log(req.body);
    const request = req.body;
    const yeRegex = /^Ye\?|ye\?$/;
    const markovRegex = /@?[gG]((arrett)|(urt))[bB]ot,? talk to me/;
    const shadesRegex = /((50|[fF]ifty) [sS]hades [Oo]f [Gg]r[ea]y)/;
    const gifRegex = /#[0-9a-zA-Z ]+/;
    const leaderRegex = /-leaderboard/;
    const directionsRegex = /[dD]irections from[:]? ([0-9a-zA-Z .,]+) [tT]o[:]? ([0-9a-zA-Z .,]+)/;
    const jokeRegex = /@?[gG]((arrett)|(urt))[bB]ot,? tell me a joke/;
    const jokeRegex2 = /@?[gG]((arrett)|(urt))[bB]ot,? joke/;
    const eightBallRegex = /@?[gG]((arrett)|(urt))[bB]ot,? [a-zA-Z0-9 ]+\?{1}/;
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/;
    console.log(request.text);
    try {
        if (request.text && urlRegex.test(request.text)) {
            console.log("don't care");
            res.send('didn\'t do anything');
        } else if (request.text && yeRegex.test(request.text)) {
            postMessage();
            res.send('did the ye thing');
        } else if (request.text && shadesRegex.test(request.text)) {
            await gifTag('hot garbage');
            res.send('50 shades thing');
        } else if (request.text && gifRegex.test(request.text)) {
            console.log('gif requested');
            gifTag(request.text);
            res.send('sent a gif');
        } else if (request.text && jokeRegex.test(request.text)) {
            console.log('telling a joke');
            tellJoke();
            res.send('sent a joke');
        } else if (request.text && jokeRegex2.test(request.text)) {
            console.log('telling a joke');
            tellJoke();
            res.send('sent a joke');
        } else if (request.text && eightBallRegex.test(request.text)) {
            console.log('eight ball');
            sendEightBallMsg();
            res.send('sent an 8 ball thing');
        } else if (request.text && leaderRegex.test(request.text)) {
            res.writeHead(200);
            // doLeaderboard();
            res.send('don\'t care');
        } else if (request.text && markovRegex.test(request.text)) {
            createMarkovString();
            res.send('markov');
        } else if (request.text && directionsRegex.test(request.text)) {
            getDirections(request.text);
            res.send('directions');
        } else {
            messages.push(request.text);
            console.log("don't care");
            res.send('dont care');
        }
    } catch (e) {
        await sendResponse(e.message, true);
        res.status(400);
        res.send(e.message);
    }
});


// async function scrape() {
//     const url = 'https://icanhazdadjoke.com/search?limit=30&page=';
//     const jokes = [];
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
//     let page = 1;
//     for (let i = 1; i <= 15; i++) {
//         console.log('delaying');
//         await delay(5000);
//         console.log('finished delay');
//         const options = {
//             uri: `${url}${i}`,
//             headers: {
//                 Accept: 'application/json'
//             }
//         }
//         console.log(options.uri);
//         let response = await requestPro(options);
//         response = JSON.parse(response);
//         console.log(response.results);
//         for (let j = 0; j < response.results.length; j++) {
//             if (response.results[j]) {
//                 jokes.push(response.results[j].joke);
//             }
//         }
//         console.log(`current joke size: ${jokes.length}`);

//     }
//     fs.writeFileSync('jokes.json', JSON.stringify(jokes));
//     console.log(jokes.length);


// }


module.exports = {
    respond
};
