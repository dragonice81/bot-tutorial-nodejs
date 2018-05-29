/* eslint no-underscore-dangle: 0 */
const testServer = require('../test-server');
const rewire = require('rewire');
require('dotenv').config();

const baseRequest = testServer.baseRequest;

const gif = rewire('../../../bot_actions/gif.js');
// const sendMessage = rewire('../../../bot_actions/send_message.js');

const stubFn = (botResponse, error) => ({botResponse, error});

describe('gif tests', () => {
    gif.__set__('sendMessage', stubFn);
    it('sends a gif', () => baseRequest
        .post('/')
        .send({
            text: '#test',
            name: 'test',
            group_id: process.env.BOT_TEST_ID
        })
        .then((res) => {
            console.log(gif);
            res.text.should.equal('#test');
        }));
});

