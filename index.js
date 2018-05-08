const express = require('express');
const getPort = require('get-port');
const bodyParser = require('body-parser');
const bot = require('./bot.js');
const schedule = require('node-schedule');

const cronString420 = '20 15 20 4 *';
const cronString4202 = '0 0 20 4 *';

const app = express();

const defaultPort = Number(process.env.PORT || 5000);

// json bodyParser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '512mb'}));


// routes
app.post('/', bot.respond());

schedule.scheduleJob(cronString4202, async () => {
    await bot.sendResponse('https://youtu.be/wWSAI9d3Vxk?t=38');
});

schedule.scheduleJob(cronString420, async () => {
    await bot.sendResponse('https://www.youtube.com/watch?v=a8axSH9XnDk');
});

getPort(defaultPort).then((port) => {
    app.listen(port, async () => {
        console.log(`listening on port ${port}`);
        if (process.env.NODE_ENV === 'development') {
            console.log(`Navigate to http://localhost:${port} to use the application`); // eslint-disable-line no-console
        }
    });
});

module.exports = app;
