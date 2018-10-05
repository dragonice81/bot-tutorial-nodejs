const SpotifyWebApi = require('spotify-web-api-node');

const callbackUrl = 'https://garrettbot-docker.herokuapp.com/health';

const authorize = () => {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: callbackUrl
  });
  spotifyApi.setAccessToken(process.env.SPOTIFY_ACCESS_TOKEN);
  spotifyApi.setRefreshToken(process.env.SPOTIFY_REFRESH_TOKEN);
  return spotifyApi;
};

const refreshToken = async (spotifyApi) => {
  const data = await spotifyApi.refreshAccessToken();
  let expirationTime = new Date().getTime() / 1000;
  expirationTime += data.body.expires_in;
  spotifyApi.setAccessToken(data.body.access_token);
  return {spotifyApi, expirationTime};
};

const checkIfTokenNeedsRefresh = expirationTime => new Date().getTime() / 1000 > expirationTime;

module.exports = {
  authorize,
  refreshToken,
  checkIfTokenNeedsRefresh
};
