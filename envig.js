'use strict';

const fs = require('fs');
const BoolRegExp = /^true$|^yes$|^on$/i;

class Environment {

  constructor(filepath) {
    this.env = Object.create(null);

    if (arguments.length) {
      this.load(filepath);
    }
  }

  merge(env) {
    if (env instanceof Environment) {
      env = env.env;
    }

    if (Buffer.isBuffer(env)) {
      env = env.toString();
    }

    if (typeof env === 'string') {
      env = JSON.parse(env);
    }

    if (env == null) {
      env = Object.create(null);
    }

    const keys = Object.keys(env);

    for (let k of keys) {
      if (typeof env[k] !== 'string') {
        throw new Error(`value for key "${k}" must be a string`);
      }
    }

    Object.assign(this.env, env);

    return keys;
  }

  load(filepath, callback) {
    if (typeof filepath !== 'string') {
      throw new Error('filepath must be a string');
    }

    if (arguments.length === 1) {
      this.merge(fs.readFileSync(filepath));

      return;
    }

    fs.readFile(filepath, (err, data) => {
      if (err !== null) {
        callback(err, null);

        return;
      }

      try {
        callback(null, this.merge(data));
      }
      catch (err) {
        callback(err, null);
      }
    });
  }

  save(filepath, callback) {
    const data = JSON.stringify(this.env);

    fs.writeFile(filepath, data, (err) => {
      if (callback) {
        callback(err, data);
      }
    });
  }

  get(key, def, type) {
    if (key == null) {
      throw new Error('key cannot be null');
    }

    if (typeof key !== 'string') {
      key = String(key);
    }

    let value;

    if (process.env.hasOwnProperty(key)) {
      value = process.env[key];
    }
    else if (key in this.env) {
      value = this.env[key];
    }
    else if (arguments.length === 1) {
      return null;
    }
    else if (arguments.length === 2) {
      return def;
    }
    else {
      value = def;
    }

    if (value == null) {
      return type === Number ? NaN : type === Boolean ? false : null;
    }

    switch (type) {
      case Object:
        return typeof value === 'string' ? JSON.parse(value) : value;
      case Number:
        return typeof value === 'object' ? NaN : Number(value);
      case String:
        return typeof value === 'object' ? JSON.stringify(value) : String(value);
      case Function: // jshint -W061
        return typeof value === 'string' ? Function(value) : null;
      case Boolean:
        return typeof value === 'string' ? isNaN(value) ? BoolRegExp.test(value) : Boolean(parseFloat(value)) : !!value;
    }

    return typeof type === 'function' ? type(value) : value;
  }

  set(key, val) {
    if (key == null) {
      throw new Error('key cannot be null');
    }

    if (typeof key !== 'string') {
      key = String(key);
    }

    if (val == null) {
      val = '';
    }
    else if (typeof val !== 'string') {
      val = String(val);
    }

    this.env[key.toUpperCase()] = val;
  }

  keys() {
    return Object.keys(this.env);
  }
}

module.exports = { Environment };
