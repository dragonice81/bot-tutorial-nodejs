import { GroupMeMessage } from "models";

const predict = require('eightball');
const sendMessage = require('./send_message');

export const sendEightBallMsg = async (message: GroupMeMessage) => {
  const response = predict();
  await sendMessage({response, group_id: message.group_id});
};
