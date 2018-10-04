const sendMessage = require('./send_message');

const getSearchTerm = (message) => {
  const splitMessage = message.split(' ');
  let searchTerm = '';
  for (let i = 2; i < splitMessage.length; i += 1) {
    searchTerm += `${splitMessage[i]} `;
  }
  return searchTerm.trim();
};


const search = async (spotifyApi, term) => {
  console.log(term);
  const data = await spotifyApi.search(term, ['artist', 'track'], {limit: 1});
  if (data && data.body && data.body.artists && data.body.artists.items.length) {
    return data.body.artists.items[0].uri;
  }
  if (data && data.body && data.body.tracks && data.body.tracks.items.length) {
    return data.body.tracks.items[0].uri;
  }
  return undefined;
};

const playSong = async (message, spotifyApi) => {
  const songUri = await search(spotifyApi, getSearchTerm(message));
  if (!songUri) {
    await sendMessage({response: 'No results found!', group_id: message.group_id});
    return;
  }
  await spotifyApi.play({uris: [songUri]});
};

module.exports = {
  playSong
};
