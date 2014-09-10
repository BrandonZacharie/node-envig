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
        it('returns a value', function () {
            keys.forEach(function (k) {
                should(environment.get(k)).equal(env[k]);
            });
        });
        describe('invoked with a type', function () {
            var environment = new Environment;;

            it('returns the value returned from a function when provided as the type', function () {
                environment.get('FUNCTION', 123, function (v) { return v === 123; }).should.be.exactly(true);
            });
            it('returns a function when the type is Function', function () {
                var f = environment.get('FUNCTION', 'return 123', Function);

                f.should.be.a.Function;
                f().should.be.exactly(123);
            });
            it('returns a number when the type is Number', function () {
                environment.get('NUMBER', 123, Number).should.be.exactly(123);
                environment.get('NUMBER', '123', Number).should.be.exactly(123);
                environment.get('NUMBER', true, Number).should.be.exactly(1);
                environment.get('NUMBER', false, Number).should.be.exactly(0);
                environment.get('NUMBER', { foo: 'bar' }, Number).should.be.NaN;
            });
            it('returns a string when the type is String', function () {
                environment.get('STRING', { foo: 'bar' }, String).should.eql('{"foo":"bar"}');
                environment.get('STRING', ['foo', 'bar'], String).should.eql('["foo","bar"]');
                environment.get('STRING', true, String).should.eql('true');
                environment.get('STRING', 0, String).should.eql('0');
            });
            it('returns an object when the type is Object', function () {
                environment.get('OBJECT', '{"foo":"bar"}', Object).should.eql({ foo: 'bar' });
                environment.get('OBJECT', '["foo","bar"]', Object).should.eql(['foo', 'bar']);
            });
            it('returns a boolean when the type is Boolean', function () {
                environment.get('BOOLEAN', true, Boolean).should.be.exactly(true);
                environment.get('BOOLEAN', false, Boolean).should.be.exactly(false);

                //return a 'truthy' value as true
                environment.get('BOOLEAN', {}, Boolean).should.be.exactly(true);
                environment.get('BOOLEAN', [], Boolean).should.be.exactly(true);

                //return a 'falsey' value as false
                environment.get('BOOLEAN', null, Boolean).should.be.exactly(false);
                environment.get('BOOLEAN', undefined, Boolean).should.be.exactly(false);

                //'true', 'yes', and 'on' return true
                environment.set('BOOLEAN', 'true');
                environment.get('BOOLEAN', false, Boolean).should.be.exactly(true);
                environment.set('BOOLEAN', 'yes');
                environment.get('BOOLEAN', false, Boolean).should.be.exactly(true);
                environment.set('BOOLEAN', 'on');
                environment.get('BOOLEAN', false, Boolean).should.be.exactly(true);

                //strings representing numbers === 0 return false
                environment.set('BOOLEAN', '0');
                environment.get('BOOLEAN', true, Boolean).should.be.exactly(false);
                environment.set('BOOLEAN', '00000000');
                environment.get('BOOLEAN', true, Boolean).should.be.exactly(false);

                //strings representing numbers !== 0 return true
                environment.set('BOOLEAN', '1');
                environment.get('BOOLEAN', false, Boolean).should.be.exactly(true);
                environment.set('BOOLEAN', '-1');
                environment.get('BOOLEAN', false, Boolean).should.be.exactly(true);
                environment.set('BOOLEAN', '0.1');
                environment.get('BOOLEAN', false, Boolean).should.be.exactly(true);
                environment.set('BOOLEAN', '123456789');
                environment.get('BOOLEAN', false, Boolean).should.be.exactly(true);

                //random strings (i.e. 'asdf', 'false') return false
                environment.set('BOOLEAN', 'false');
                environment.get('BOOLEAN', true, Boolean).should.be.exactly(false);
                environment.set('BOOLEAN', 'ujelly');
                environment.get('BOOLEAN', true, Boolean).should.be.exactly(false);
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
