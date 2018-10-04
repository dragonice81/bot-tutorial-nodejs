const sendMessage = require('./send_message');

const SpotifyClient = require('../external_services/spotify_client');

let spotifyApi;
let expirationTime;

const initApi = async () => {
  spotifyApi = SpotifyClient.authorize();
  const refreshedClient = await SpotifyClient.refreshToken(spotifyApi);
  spotifyApi = refreshedClient.spotifyApi;
  expirationTime = refreshedClient.expirationTime;
};

const checkSpotifyApi = async () => {
  if (!spotifyApi) {
    await initApi();
  }
  if (SpotifyClient.checkIfTokenNeedsRefresh(expirationTime)) {
    const client = await SpotifyClient.refreshToken(spotifyApi);
    spotifyApi = client.spotifyApi;
    expirationTime = client.expirationTime;
  }
};

const isSpotifyPlaying = async () => {
  await checkSpotifyApi();
  const data = await spotifyApi.getMyCurrentPlayingTrack();
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
  const data = await spotifyApi.search(term, ['artist', 'track'], {limit: 1});
  if (data && data.body && data.body.artists && data.body.artists.items.length) {
    return data.body.artists.items[0].uri;
  }
  if (data && data.body && data.body.tracks && data.body.tracks.items.length) {
    return data.body.tracks.items[0].uri;
  }
  return undefined;
};

const playSong = async (message) => {
  await checkSpotifyApi();
  const songUri = await search(getSearchTerm(message));
  if (!songUri) {
    await sendMessage({response: 'No results found!', group_id: message.group_id});
    return;
  }
  await spotifyApi.play({uris: [songUri]});
};

module.exports = {
  playSong,
  isSpotifyPlaying
};
