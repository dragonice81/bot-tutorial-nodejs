import { GroupMeMessage } from "models";

const ud = require('urban-dictionary');
const sendMessage = require('./send_message');

const getSearchTerm = (text: string) => {
  const messageArray = text.split(' ');
  let term = '';
  for (let i = 2; i < messageArray.length; i += 1) {
    term += `${messageArray[i]} `;
  }
  term = term.trim();
  return term;
};

export const define = async (message: GroupMeMessage) => {
  const term = getSearchTerm(message.text);
  const definitions = await ud.term(term);
  // const definition = _.sample(definitions.entries);
  // TODO: randomize?
  await sendMessage({response: definitions.entries[0].definition, group_id: message.group_id});
};
