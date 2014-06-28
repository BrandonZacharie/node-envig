function Environment(filepath) {
    this.env = {};

    if (arguments.length)
        this.load(filepath);
}

Environment.prototype.load = function (filepath) {
    var self = this
      , env = require(filepath)
      , keys = Object.keys(env);
    
    keys.forEach(function (key) {
        if (typeof env[key] !== 'string')
            throw new Error('Invalid value');
    });
    
    keys.forEach(function (key) {
        self.env[key] = env[key];
    });

    return keys;
}

Environment.prototype.get = function (key, def) {
    if (key === null || key === undefined)
        throw new Error('Invalid key');

    if (typeof key !== 'string')
        key = String(key);

    return process.env.hasOwnProperty(key)
        ? process.env[key]
        : this.env.hasOwnProperty(key)
            ? this.env[key]
            : arguments.length < 2
                ? null
                : def;
};

Environment.prototype.set = function (key, val) {
    if (key === null || key === undefined)
        throw new Error('Invalid key');
    
    if (typeof key !== 'string')
        key = String(key);

    if (val === null || val === undefined)
        val = '';
    else if (typeof val !== 'string')
        val = String(val);

    this.env[key.toUpperCase()] = val;
};

module.exports = {
    Environment: Environment
};
