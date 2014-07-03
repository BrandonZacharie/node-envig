var fs = require('fs');

function Environment(filepath) {
    this.env = {};

    if (arguments.length)
        this.load(filepath);
}

Environment.prototype.loadJSON = function (data) {
    var env = JSON.parse(data)
      , keys = Object.keys(env)
      , l = keys.length
      , i, k;

    for (i = 0; i < l; ++i)
        if (typeof env[keys[i]] !== 'string')
            throw new Error('Invalid value');

    for (i = 0, k = keys[0]; i < l; ++i, k = keys[i])
        this.env[k] = env[k];

    return keys;
};

Environment.prototype.load = function (filepath, callback) {
    var self = this;

    fs.readFile(filepath, function (err, data) {
        if (err !== null) {
            callback(err, null);
        }
        else try {
            callback(null, self.loadJSON(data));
        }
        catch (err) {
            callback(err, null);
        }
    });
};

Environment.prototype.save = function (filepath, callback) {
    var data = JSON.stringify(this.env);

    fs.writeFile(filepath, data, function (err) {
        if (callback)
            callback(err, data);
    });
};

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

Environment.prototype.keys = function () {
    return Object.keys(this.env);
};

module.exports = {
    Environment: Environment
};
