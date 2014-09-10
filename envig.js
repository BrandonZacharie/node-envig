var fs = require('fs')
  , BoolRegExp = /^true$|^yes$|^on$/i;

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

    if (arguments.length === 1) {
        this.loadJSON(fs.readFileSync(filepath));

        return;
    }

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

Environment.prototype.get = function (key, def, type) {
    if (key == null)
        throw new Error('Invalid key');

    if (typeof key !== 'string')
        key = String(key);

    var value;

    if (process.env.hasOwnProperty(key))
        value = process.env[key];
    else if (this.env.hasOwnProperty(key))
        value = this.env[key];
    else if (arguments.length === 1)
        return null;
    else if (arguments.length === 2)
        return def;
    else
        value = def;

    if (value == null)
        return type === Number ? NaN : type === Boolean ? false : null;

    switch (type) {
        case Object:
            return typeof value === 'string' ? JSON.parse(value) : value;
        case Number:
            return typeof value === 'object' ? NaN : Number(value);
        case String:
            return typeof value === 'object' ? JSON.stringify(value) : String(value);
        case Function:
            return typeof value === 'string' ? Function(value) : null;
        case Boolean:
            return typeof value === 'string' ? isNaN(value) ? BoolRegExp.test(value) : Boolean(parseFloat(value)) : !!value;
    }

    return typeof type === 'function' ? type(value) : value;
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
