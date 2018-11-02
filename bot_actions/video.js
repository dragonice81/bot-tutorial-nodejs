const _ = require('lodash');
const logger = require('../logger');
let videos = require('../videos.json');
const sendMessage = require('./send_message');


let saidVideos = [];
const sendVideo = async (message) => {
  if (videos.length === 0) {
    logger.info('no songs found');
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
  await sendMessage({response: video.video, group_id: message.group_id});
};

module.exports = sendVideo;
