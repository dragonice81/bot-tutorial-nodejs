const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');

chai.use(chaiHttp);
chai.should();
const baseRequest = chai.request(server);

module.exports = {
    baseRequest
};
