const wrap = fn => (...args) => fn(...args).catch(args[2]);

module.exports = wrap;
