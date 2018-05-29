const request = require('request-promise-native');
const readFile = require('fs-readfile-promise');

const sendToGroupmeImageService = async (filePath) => {
    const image = await readFile(`${filePath}`);
    const response = await request.post('https://image.groupme.com/pictures', {
        headers: {
            'x-access-token': process.env.GM_ACCESS_TOKEN,
            'content-type': 'image/gif'
        },
        body: image
    });
    return response;
};

module.exports = sendToGroupmeImageService;
