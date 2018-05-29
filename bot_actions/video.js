let videos = require('../videos.json');
const _ = require('lodash');
const sendMessage = require('./send_message');


let saidVideos = [];
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
    await sendMessage({response: video.video, group_id: message.group_id});
};

module.exports = sendVideo;
