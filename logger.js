const winston = require('winston');

const tsFormat = () => new Date();

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true})
    ]
});

function logFilename(args) {
    const stacklist = (new Error()).stack.split('\n').slice(3);
    const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;

    const s = stacklist[0];
    const sp = stackReg.exec(s);

    if (sp && sp.length === 5) {
        console.log(`${sp[2]}:${sp[3]}`); // eslint-disable-line no-console
    }
    return args;
}

if (process.env.NODE_ENV === 'development') {
    logger.stream = {
        write(message) {
            logger.info(message);
        }
    };

    module.exports.debug = (...args) => {
        logger.debug(...logFilename(args));
    };

    module.exports.info = (...args) => {
        logger.info(...logFilename(args));
    };

    module.exports.warn = (...args) => {
        logger.warn(...logFilename(args));
    };

    module.exports.error = (...args) => {
        logger.error(...logFilename(args));
    };

    module.exports.stream = logger.stream;
} else {
    module.exports = logger;
}
