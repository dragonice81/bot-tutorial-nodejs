import { GroupMeMessage } from "models";

const _ = require('lodash');
const sendMessage = require('./send_message');


export const yeOrNerr = async (message: GroupMeMessage) => {
  let response;

  const number = _.random(1, 101);
  if (number >= 90) {
    response = 'nerr';
  } else {
    response = 'ye';
  }
  await sendMessage({response, group_id: message.group_id});
};
