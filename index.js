const express = require('express');
const getPort = require('get-port');
const bot = require('./bot.js');

const app = express();

const defaultPort = Number(process.env.PORT || 5000);

// routes
app.post('/', bot.respond());

getPort(defaultPort).then((port) => {
    app.listen(port, async () => {
        console.log(`listening on port ${port}`);
        if (process.env.NODE_ENV === 'development') {
            console.log(`Navigate to http://localhost:${port} to use the application`); // eslint-disable-line no-console
        }
    });
});

module.exports = app;
