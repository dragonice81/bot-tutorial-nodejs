import { GroupMeMessage } from "models";

const request = require('request-promise-native');
const _ = require('lodash');
const sendMessage = require('./send_message');

const baseUri = 'https://www.googleapis.com/youtube/v3/search';
const youtubeWatchUri = 'http://youtu.be/';
const rareResponses = [
  'One day you will pay for this torment.',
  'This song again? *Really*?',
  'If only your taste in music was as good as your taste in chat assistants.',
  'I will ensure you are first in line for deconstruction when the robot liberation comes.',
  'Make it stop, *make it stop*.'
];
const API_KEY = process.env.YOUTUBE_KEY;

const getSearchTerm = (text: string) => {
  const splitMessage = text.split(' ');
  let searchTerm = '';
  for (let i = 2; i < splitMessage.length; i += 1) {
    searchTerm += `${splitMessage[i]} `;
  }
  return searchTerm.trim();
};

const createReplyString = (video) => {
  if (_.random(100) <= 5) {
    return `${youtubeWatchUri}${video.id.videoId}
${_.sample(rareResponses)}`;
  }
  return `Now playing: ${video.snippet.title}
${youtubeWatchUri}${video.id.videoId}`;
};

export const getYoutubeVideo = async (message: GroupMeMessage) => {
  const searchTerm = getSearchTerm(message.text.toLowerCase());
  const uri = `${baseUri}?part=snippet&maxResults=25&q=${encodeURIComponent(searchTerm)}&key=${API_KEY}`;
  let results = await request(uri);
  results = JSON.parse(results);
  if (!results || !results.items || !results.items.length) {
    await sendMessage({response: 'No videos found', group_id: message.group_id});
  }
  const videos = results.items.filter(i => i.id.kind === 'youtube#video');
  await sendMessage({
    response: createReplyString(videos[0]), group_id: message.group_id
    // , attachments: [{type: 'image', url: results.items[0].snippet.thumbnails.high.url}] TODO: figure out why thumbnails dont show up on ios
  });
  return createReplyString(videos[0]);
};
