import { GroupMeMessage, SpotifyPermissions } from "models";

const youtube = require('./youtube');
const spotify = require('./spotify');

export const fetchMusic = async (message: GroupMeMessage, permissions: SpotifyPermissions) => {
  const permission = permissions.users.filter(p => p.user_id === message.user_id)[0];
  const isSpotify = await spotify.isSpotifyPlaying();
  if (isSpotify && permission.canSpotify && permissions[0].IsEnabled) {
    await spotify.play(message);
  } else {
    await youtube.getYoutubeVideo(message);
  }
};
