"use strict";

var fs = require('fs')
  , should = require('should')
  , envig = require('./envig')
  , Environment = envig.Environment;

describe('Environment', function () {
    var filepath = './test.json'
      , env = { FOO: 'bar', BAR: 'foo' }
      , keys = Object.keys(env)
      , environment;

    describe('.constructor', function () {
        describe('invoked with a filepath', function () {
            it('invokes .load', function (done) {
                var load = Environment.prototype.load;

                Environment.prototype.load = done;
                
                new Environment(null);
                
                Environment.prototype.load = load;
            });
        });
        describe('invoked without a filepath', function () {
            it('returns an empty Environment', function () {
                environment = new Environment;

                environment.keys.should.have.a.lengthOf(0);
            });
        });
    });
    describe('.set', function () {
        it('throws when invoked without arguments', function () {
            environment.set.should.throw();
        });
        it('stores a value', function () {
            keys.forEach(function (k) {
                environment.set(k, env[k]);
            });
        });
    });
    describe('.get', function () {
        it('throws when invoked without arguments', function () {
            environment.get.should.throw();
        });
        it('fetchs a value', function () {
            keys.forEach(function (k) {
                should(environment.get(k)).equal(env[k]);
            });
        });
    });
    describe('.keys', function () {
        it('gets all keys set', function () {
            environment.keys().should.eql(keys);
        });
    });
    describe('.save', function () {
        it('saves a file', function (done) {
            environment.save(filepath, function (err, data) {
                (err === null).should.be.true;
                (function () { data = JSON.parse(data); }).should.not.throw();
                should(data).eql(env);
                done();
            });
        });
    });
    describe('.load', function () {
        it('invoked without a callback loads a file synchronously', function () {
            environment.load(filepath);
            environment.keys().should.eql(keys);
        });
        it('invoked with a callback loads a file asynchronously', function (done) {
            environment.load(filepath, function (err, loadedKeys) {
                (err === null).should.be.true;
                (loadedKeys === null).should.be.false;
                loadedKeys.should.eql(keys);
                loadedKeys.should.eql(environment.keys());
                done();
            });
        });
        it('fails when given a bad filepath', function (done) {
            environment.load('//', function (err, loadedKeys) {
                (err === null).should.be.false;
                err.should.be.an.Error;
                (loadedKeys === null).should.be.true;
                done();
            });
            (function () { environment.load(undefined); }).should.throw();
            (function () { environment.load(null); }).should.throw();
            (function () { environment.load(true); }).should.throw();
            (function () { environment.load(0); }).should.throw();
        });
    });
    after(function () {
        fs.unlinkSync(filepath);
    });
});
