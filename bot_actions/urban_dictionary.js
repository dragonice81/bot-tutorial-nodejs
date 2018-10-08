const sendMessage = require('./send_message');
const ud = require('urban-dictionary');

const getSearchTerm = (message) => {
  const messageArray = message.split(' ');
  let term = '';
  for (let i = 2; i < messageArray.length; i += 1) {
    term += `${messageArray[i]} `;
  }
  term = term.trim();
  return term;
};

const define = async (message) => {
  const term = getSearchTerm(message.text);
  const definitions = await ud.term(term);
  // const definition = _.sample(definitions.entries);
  // TODO: randomize?
  await sendMessage({response: definitions.entries[0].definition, group_id: message.group_id});
};

module.exports = {
  define
};
