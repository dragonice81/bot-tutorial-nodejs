import express from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';
dotenv.config();
import getPort from 'get-port';
import bodyParser from 'body-parser';
import {respond} from './controllers/bot_router';
import {logger} from './logger';


const app = express();

const defaultPort = Number(process.env.PORT || 5000);

// json bodyParser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '512mb'}));


// static resources
// app.use('/player', express.static(path.join(__dirname, 'public/web-player/dist/web-player')));

// routes
app.post('/', respond());

app.get('/health', (req, res) => {
  res.send('Ok');
});


// starting
(async () => {
  const port = await getPort({port: defaultPort});
  app.listen(port, () => {
    logger.info(`listening on port ${port}`);
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Navigate to http://localhost:${port} to use the application`);
    }
  });
})();

module.exports = app;
