import { GroupMeMessage } from "models";
import {videos} from '../data';
import _ from 'lodash';
import {sendMessage} from './sendMessage';

let saidVideos = [];
export const sendVideo = async (message: GroupMeMessage) => {
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
