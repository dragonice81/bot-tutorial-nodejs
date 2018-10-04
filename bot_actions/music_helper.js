const youtube = require('./youtube');
const spotify = require('./spotify');

const isSpotifyPlaying = async (spotifyApi) => {
  const data = await spotifyApi.getMyCurrentPlayingTrack();
  return data.body.is_playing;
};

const fetchMusic = async (message, spotifyApi, permissions) => {
  const permission = permissions.filter(p => p.user_id === message.user_id);
  const isSpotify = await isSpotifyPlaying(spotifyApi);
  if (isSpotify && permission.canSpotify && permissions[0].IsEnabled) {
    await spotify.getInfo(message, spotifyApi);
  } else {
    await youtube.getYoutubeVideo(message);
  }
};

module.exports = {
  fetchMusic
};
