var http, director, cool, bot, router, server, port;

http        = require('http');
director    = require('director');
cool        = require('cool-ascii-faces');
bot         = require('./bot.js');

var dotenv = require('dotenv');
dotenv.load();

router = new director.http.Router({
  '/' : {
    post: bot.respond,
    get: ping
  }
});

server = http.createServer(function (req, res) {
  req.chunks = [];
  req.on('data', function (chunk) {
    req.chunks.push(chunk.toString());
  });

  router.dispatch(req, res, function(err) {
    res.writeHead(err.status, {"Content-Type": "text/plain"});
    res.end(err.message);
  });
});

port = Number(process.env.PORT || 5000);
server.listen(port);

function ping() {
  console.log(process.env);
  var ye = '@garrettbot #jay cutler'
  var regex = /@garrettbot #[a-zA-Z ]+/
  var retval = '';
  if (regex.test(ye)) {
    retval = ye.substring(13).trim();
    this.res.writeHead(200);
    this.res.end(JSON.stringify(process.env));
  
  }
  else {
    this.res.writeHead(200);
    this.res.end('ye');
  
  }
}