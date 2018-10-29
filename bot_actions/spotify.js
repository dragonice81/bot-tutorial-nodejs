const schedule = require('node-schedule');

const sendMessage = require('./send_message');
const SpotifyClient = require('../external_services/spotify_client');

let spotifyApi;
let expirationTime;
const songs = [];
let timeSongEnd;
let songOffset = 0;
let nextJob;

const initApi = async () => {
  spotifyApi = SpotifyClient.authorize();
  const refreshedClient = await SpotifyClient.refreshToken(spotifyApi);
  ({spotifyApi, expirationTime} = refreshedClient);
};

const checkSpotifyApi = async () => {
  if (!spotifyApi) {
    await initApi();
  }
  if (SpotifyClient.checkIfTokenNeedsRefresh(expirationTime)) {
    const client = await SpotifyClient.refreshToken(spotifyApi);
    ({spotifyApi, expirationTime} = client);
  }
};

const isSpotifyPlaying = async () => {
  await checkSpotifyApi();
  const data = await spotifyApi.getMyCurrentPlayingTrack();
  if (!timeSongEnd && data.body.is_playing) {
    timeSongEnd = new Date().getTime() + (data.body.item.duration_ms - data.body.progress_ms - 10);
  }
  return data.body.is_playing;
};

const getSearchTerm = (message) => {
  const {text} = message;
  const splitMessage = text.split(' ');
  let searchTerm = '';
  for (let i = 2; i < splitMessage.length; i += 1) {
    searchTerm += `${splitMessage[i]} `;
  }
  return searchTerm.trim();
};

const search = async (term) => {
  await checkSpotifyApi();
  const data = await spotifyApi.search(term, ['track'], {limit: 1});
  // if (data && data.body && data.body.artists && data.body.artists.items.length) {
  //   return data.body.artists.items[0].uri;
  // }
  if (data && data.body && data.body.tracks && data.body.tracks.items.length) {
    return data.body.tracks.items[0];
  }
  return undefined;
};

const schedulePlayback = async () => schedule.scheduleJob({start: timeSongEnd, end: timeSongEnd + 1000, rule: '*/1 * * * * *'},
  async () => {
    try {
      await checkSpotifyApi();
      await spotifyApi.play({uris: [songs[songOffset].uri]});
      songOffset += 1;
      timeSongEnd = undefined;
      await isSpotifyPlaying();
      if (songOffset < songs.length) {
        await schedulePlayback();
      }
      return;
    } catch (e) {
      await sendMessage({response: e, group_id: process.env.BOT_ID_TEST});
    }
  });

const play = async (message) => {
  await checkSpotifyApi();
  const song = await search(getSearchTerm(message));
  if (!song) {
    await sendMessage({response: 'No results found!', group_id: message.group_id});
    return;
  }
  songs.push(song);
  if (nextJob) {
    nextJob.cancel();
  }
  nextJob = await schedulePlayback();
};

module.exports = {
  play,
  isSpotifyPlaying
};
