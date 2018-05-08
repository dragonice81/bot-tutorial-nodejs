/* eslint-disable no-useless-escape */
const request = require('request-promise-native');
const cool = require('cool-ascii-faces');
let videos = require('./videos');
const predict = require('eightball');
const Markov = require('markov-strings');
const messages = require('./messages');
const _ = require('lodash');
const wrap = require('./middleware/error-catcher');
let jokes = require('./jokes');
const users = require('./users');
const insults = require('./insults');
const compliments = require('./compliments');

let saidJokes = [];
let saidVideos = [];
const mainBotID = process.env.BOT_ID;
let taylorCompFlag = true;


const sendResponse = async (botResponse, error) => {
    const botID = error ? process.env.BOT_ID_TEST : mainBotID;
    console.log(`sending ${botResponse} to ${botID}`);
    const body = {
        bot_id: botID,
        text: botResponse
    };
    await request.post('https://api.groupme.com/v3/bots/post/', {body: JSON.stringify(body)});
};

const postMessage = async () => {
    let botResponse;

    botResponse = cool();

    const number = _.random(1, 101);
    if (number >= 90) {
        botResponse = 'nerr';
    } else {
        botResponse = 'ye';
    }
    await sendResponse(botResponse);
};

const sendEightBallMsg = async () => {
    await sendResponse(predict());
};

const sendVideo = async () => {
    if (videos.length === 0) {
        console.log('no songs found');
        for (let i = 0; i < saidVideos.length; i += 1) {
            saidVideos[i].said = true;
        }
        videos = saidVideos;
        saidVideos = [];
    }
    const video = _.sample(videos);
    const index = _.indexOf(videos, video);
    _.pullAt(videos, index);
    video.said = true;
    saidVideos.push(video);
    await sendResponse(video.video);
};

const tellJoke = async () => {
    if (jokes.length === 0) {
        console.log('no jokes found');
        for (let i = 0; i < saidJokes.length; i += 1) {
            saidJokes[i].said = true;
        }
        jokes = saidJokes;
        saidJokes = [];
    }
    const joke = _.sample(jokes);
    const index = _.indexOf(jokes, joke);
    _.pullAt(jokes, index);
    joke.said = true;
    saidJokes.push(jokes);
    await sendResponse(joke.joke);
};

const gifTag = async (message) => {
    try {
        const parsedData = JSON.parse(await request.get(`https://api.giphy.com/v1/gifs/search?q=${message.split('#')[1].trim()}&api_key=dc6zaTOxFJmzC&rating=r&limit=25`));

        console.log(`split msg: ${message.split('#')[1].trim()}`);
        if (parsedData && parsedData.data) {
            if (parsedData.data.length) {
                const giphyResponse = _.sample(parsedData.data);
                const botResponse = giphyResponse.images.downsized.url;
                await sendResponse(botResponse);
            } else {
                console.log(parsedData);
            }
        } else {
            console.log(`No gifs for ${message}`);
            await gifTag('#random');
        }
    } catch (e) {
        console.log(`gifTag error: ${e}`);
    }
};

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

const getDirections = async (directionString) => {
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
    const botResponse =
      `Directions to ${destLocString.replace(/[+]/g, ' ')} from ${beginningLocString.replace(/[+]/g, ' ')}

It will take ${response.routes[0].legs[0].duration.text} to travel ${response.routes[0].legs[0].distance.text}

Click this to start navigation: ${shortUrl}`;
    await sendResponse(botResponse);
};

const createMarkovString = async () => {
    const score = _.random(100);
    const markovOptions = {
        maxLength: 140,
        minWords: 7,
        minScore: score
    };
    const markov = new Markov(messages, markovOptions);
    await markov.buildCorpus();
    const result = await markov.generateSentence();
    console.log(`minScore: ${score}`);
    await sendResponse(result.string);
};

const extractNameFromMessage = (message) => {
    const splitMessage = message.toLowerCase().split(' ');
    for (let i = 0; i < users.length; i += 1) {
        if (splitMessage.includes(users[i].toLowerCase())) {
            return `@${users[i]}, `;
        }
    }
    return '';
};

const sendComplimentOrInsult = async (message) => {
    const complimentflag = message.toLowerCase().includes('compliment');
    const name = extractNameFromMessage(message);
    let response;
    if (complimentflag) {
        response = `${name}${_.sample(compliments)}`;
        if (name.includes('Taylor') && taylorCompFlag) {
            response = `${name} people may say you're 649 years old, but I don't think you look a day over 273`;
            taylorCompFlag = false;
        }
    } else {
        response = `${name}${_.sample(insults)}`;
    }
    await sendResponse(response);
};

const respond = () => wrap(async (req, res) => {
    const message = req.body;
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
    const musicRegex = /@?[gG]((arrett)|(urt))[bB]ot,? give me a song/;
    const musicRegex2 = /@?[gG]((arrett)|(urt))[bB]ot,? song/;
    const complimentRegex = /@?[gG]((arrett)|(urt))[bB]ot,? ((compliment)|(insult)) [a-zA-Z]+/;
    const complimentRegex2 = /@?[gG]((arrett)|(urt))[bB]ot,? ((tell)|(send)) [a-zA-Z]+ an? ((compliment)|(insult))/;
    const randomNumberRegex = /@?[gG]((arrett)|(urt))[bB]ot,? random number/;
    console.log(message.text);
    try {
        if (message.text && urlRegex.test(message.text)) {
            console.log("don't care");
            res.send('didn\'t do anything');
        } else if (message.text && yeRegex.test(message.text)) {
            postMessage();
            res.send('did the ye thing');
        } else if (message.text && shadesRegex.test(message.text)) {
            await gifTag('hot garbage');
            res.send('50 shades thing');
        } else if (message.text && gifRegex.test(message.text)) {
            console.log('gif requested');
            await gifTag(message.text);
            res.send('sent a gif');
        } else if (message.text && jokeRegex.test(message.text)) {
            console.log('telling a joke');
            await tellJoke();
            res.send('sent a joke');
        } else if (message.text && jokeRegex2.test(message.text)) {
            console.log('telling a joke');
            await tellJoke();
            res.send('sent a joke');
        } else if (message.text && eightBallRegex.test(message.text)) {
            console.log('eight ball');
            await sendEightBallMsg();
            res.send('sent an 8 ball thing');
        } else if (message.text && leaderRegex.test(message.text)) {
            res.writeHead(200);
            // doLeaderboard();
            res.send('don\'t care');
        } else if (message.text && markovRegex.test(message.text)) {
            await createMarkovString();
            res.send('markov');
        } else if (message.text && directionsRegex.test(message.text)) {
            await getDirections(message.text);
            res.send('directions');
        } else if (message.text && (musicRegex.test(message.text) || musicRegex2.test(message.text))) {
            await sendVideo();
            res.send('video');
        } else if (message.text && (complimentRegex.test(message.text) || complimentRegex2.test(message.text))) {
            await sendComplimentOrInsult(message.text);
            res.send('compliment');
        } else if (message.text && randomNumberRegex.test(message.text)) {
            await sendResponse(`${_.random(100)}`);
            res.send('compliment');
        } else {
            messages.push(message.text);
            console.log("don't care");
            res.send('dont care');
        }
    } catch (e) {
        await sendResponse(e.message, true);
        res.status(400);
        res.send(e.message);
    }
});

module.exports = {
    respond,
    sendResponse
};
