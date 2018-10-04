const youtube = require('./youtube');
const spotify = require('./spotify');

const fetchMusic = async (message, permissions) => {
  const permission = permissions.filter(p => p.user_id === message.user_id)[0];
  const isSpotify = await spotify.isSpotifyPlaying();
  if (isSpotify && permission.canSpotify && permissions[0].IsEnabled) {
    await spotify.playSong(message);
  } else {
    await youtube.getYoutubeVideo(message);
  }
};

module.exports = {
  fetchMusic
};
