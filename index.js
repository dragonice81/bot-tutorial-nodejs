let http,
    director,
    cool,
    bot,
    router,
    server,
    port;

http = require('http');
director = require('director');
cool = require('cool-ascii-faces');
bot = require('./bot.js');


router = new director.http.Router({
    '/': {
        post: bot.respond,
        get: ping
    }
});

server = http.createServer((req, res) => {
    req.chunks = [];
    req.on('data', (chunk) => {
        req.chunks.push(chunk.toString());
    });

    router.dispatch(req, res, (err) => {
        res.writeHead(err.status, {'Content-Type': 'text/plain'});
        res.end(err.message);
    });
});

port = Number(process.env.PORT || 5000);
server.listen(port);

function ping() {
    const ye = '@garrettbot #jay cutler';
    const regex = /@garrettbot #[a-zA-Z ]+/;
    let retval = '';
    if (regex.test(ye)) {
        retval = ye.substring(13).trim();
        this.res.writeHead(200);
        this.res.end('ye');
    } else {
        this.res.writeHead(200);
        this.res.end('ye');
    }
}
