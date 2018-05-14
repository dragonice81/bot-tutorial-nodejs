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


const getBotId = (groupId) => {
    if (+groupId === 21255858) {
        return process.env.BROM_BOT_ID;
    } else if (+groupId === 39437389) {
        return process.env.AMERICA_BOT_ID;
    }
    return undefined;
};

const sendResponse = async (botResponse, error) => {
    const messageBotId = getBotId(botResponse.group_id);
    const botID = error || !messageBotId ? process.env.BOT_ID_TEST : messageBotId;
    console.log(`sending ${botResponse.response} to ${botID}`);
    const body = {
        bot_id: botID,
        text: botResponse.response
    };
    await setTimeout(() => { console.log('waiting'); }, 50);
    await request.post('https://api.groupme.com/v3/bots/post/', {body: JSON.stringify(body)});
};

const postMessage = async (message) => {
    let response;

    response = cool();

    const number = _.random(1, 101);
    if (number >= 90) {
        response = 'nerr';
    } else {
        response = 'ye';
    }
    await sendResponse({response, group_id: message.group_id});
};

const sendEightBallMsg = async (message) => {
    const response = predict();
    await sendResponse({response, group_id: message.group_id});
};

const sendVideo = async (message) => {
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
    await sendResponse({response: video.video, group_id: message.group_id});
};

const tellJoke = async (message) => {
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
    await sendResponse({response: joke.joke, group_id: message.group_id});
};

const gifTag = async (message) => {
    try {
        const parsedData = JSON.parse(await request.get(`https://api.giphy.com/v1/gifs/search?q=${message.text.split('#')[1].trim()}&api_key=dc6zaTOxFJmzC&rating=r&limit=25`));

        console.log(`split msg: ${message.text.split('#')[1].trim()}`);
        if (parsedData && parsedData.data) {
            if (parsedData.data.length) {
                const giphyResponse = _.sample(parsedData.data);
                const botResponse = giphyResponse.images.downsized.url;
                await sendResponse({response: botResponse, group_id: message.group_id});
            } else {
                console.log(parsedData);
            }
        } else {
            console.log(`No gifs for ${message.text}`);
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
    const botResponse =
      `Directions to ${destLocString.replace(/[+]/g, ' ')} from ${beginningLocString.replace(/[+]/g, ' ')}

It will take ${response.routes[0].legs[0].duration.text} to travel ${response.routes[0].legs[0].distance.text}

Click this to start navigation: ${shortUrl}`;
    await sendResponse({response: botResponse, group_id: message.group_id});
};

const createMarkovString = async (message) => {
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
    await sendResponse({response: result.string, group_id: message.group_id});
};

const extractNameFromMessage = (message) => {
    const splitMessage = message.text.toLowerCase().split(' ');
    for (let i = 0; i < users.length; i += 1) {
        if (splitMessage.includes(users[i].toLowerCase())) {
            if (users[i] === 'Me') {
                return `@${message.name}, `;
            }
            return `@${users[i]}, `;
        }
    }
    return '';
};

const sendComplimentOrInsult = async (message) => {
    const complimentflag = message.text.toLowerCase().includes('compliment');
    const name = extractNameFromMessage(message);
    let response;
    if (complimentflag) {
        response = `${name}${_.sample(compliments)}`;
    } else {
        response = `${name}${_.sample(insults)}`;
    }
    await sendResponse({response, group_id: message.group_id});
};

// TODO:
const findRestaurant = async (message) => {
    console.log(message);
};

const phraseMap = new Map([
    [/^Ye\?|ye\?$/, async message => postMessage(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? talk to me/, async message => createMarkovString(message)],
    [/((50|[fF]ifty) [sS]hades [Oo]f [Gg]r[ea]y)/, async message => gifTag({text: 'hot garbage', group_id: message.group_id})],
    [/#[0-9a-zA-Z ]+/, async message => gifTag(message)],
    [/[dD]irections from[:]? ([0-9a-zA-Z .,]+) [tT]o[:]? ([0-9a-zA-Z .,]+)/, async message => getDirections(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? tell me a joke/, async message => tellJoke(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? joke/, async message => tellJoke(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? [a-zA-Z0-9 ]+\?{1}/, async message => sendEightBallMsg(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? give me a song/, async message => sendVideo(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? song/, async message => sendVideo(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? ((compliment)|(insult)) [a-zA-Z]+/, async message => sendComplimentOrInsult(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? ((tell)|(send)) [a-zA-Z]+ an? ((compliment)|(insult))/, async message => sendComplimentOrInsult(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? random number/, async () => sendResponse(`${_.random(100)}`)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? find me a restaurant near ([0-9a-zA-Z .,]+)/, async message => findRestaurant(message)],
    [/@?[gG]((arrett)|(urt))[bB]ot,? restaurant near ([0-9a-zA-Z .,]+)/, , async message => findRestaurant(message)]
]);


const respond = () => wrap(async (req, res) => {
    const message = req.body;
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/;
    if (!message.text || (message.text && urlRegex.test(message.text))) {
        console.log("don't care");
        res.send('didn\'t do anything');
        return;
    }
    phraseMap.forEach(async (func, regEx) => {
        try {
            if (regEx.test(message.text)) {
                await func(message);
                res.send(message.text);
            }
        } catch (e) {
            await sendResponse(e.message, true);
            res.status(400);
            res.send(e.message);
        }
    });
});

module.exports = {
    respond,
    sendResponse
};
