'use strict';

const fs = require('fs');
const chai = require('chai')
const envig = require('./envig');
const expect = chai.expect;
const Environment = envig.Environment;

describe('Environment', () => {
  const filepath = './test.json';
  const env = { FOO: 'bar', BAR: 'foo' };
  const keys = Object.keys(env);
  let environment;

  describe('.constructor()', () => {
    describe('invoked with a filepath', () => {
      it('invokes .load()', (done) => {
        const load = Environment.prototype.load;

        Environment.prototype.load = done;

        new Environment(null);

        Environment.prototype.load = load;
      });
    });
    describe('invoked without a filepath', () => {
      it('returns an empty Environment', () => {
        environment = new Environment();

        expect(environment.keys()).to.be.an('array').and.have.length(0);
      });
    });
  });
  describe('.set()', () => {
    it('throws when invoked without arguments', () => {
      expect(() => environment.set()).to.throw();
    });
    it('stores a value', () => {
      for (let k of keys) {
        environment.set(k, env[k]);
      }
    });
  });
  describe('.get()', () => {
    it('throws when invoked without arguments', () => {
      expect(() => environment.get()).to.throw();
    });
    it('returns a value', () => {
      for (let k of keys) {
        expect(environment.get(k)).to.equal(env[k]);
      }
    });
    describe('invoked with a type', () => {
      var environment = new Environment();

      it('returns the value returned from a function when provided as the type', () => {
        expect(environment.get('FUNCTION', 123, (v) => v === 123)).to.equal(true);
      });
      it('returns a function when the type is Function', () => {
        var f = environment.get('FUNCTION', 'return 123', Function);

        expect(f).to.be.a('function');
        expect(f()).to.equal(123);
      });
      it('returns a number when the type is Number', () => {
        expect(environment.get('NUMBER', 123, Number)).to.equal(123);
        expect(environment.get('NUMBER', '123', Number)).to.equal(123);
        expect(environment.get('NUMBER', true, Number)).to.equal(1);
        expect(environment.get('NUMBER', false, Number)).to.equal(0);
        expect(environment.get('NUMBER', { foo: 'bar' }, Number)).to.be.NaN;
      });
      it('returns a string when the type is String', () => {
        expect(environment.get('STRING', { foo: 'bar' }, String)).to.equal('{"foo":"bar"}');
        expect(environment.get('STRING', ['foo', 'bar'], String)).to.equal('["foo","bar"]');
        expect(environment.get('STRING', true, String)).to.equal('true');
        expect(environment.get('STRING', 0, String)).to.equal('0');
      });
      it('returns an object when the type is Object', () => {
        expect(environment.get('OBJECT', '{"foo":"bar"}', Object)).to.eql({ foo: 'bar' });
        expect(environment.get('OBJECT', '["foo","bar"]', Object)).to.eql(['foo', 'bar']);
      });
      it('returns a boolean when the type is Boolean', () => {
        expect(environment.get('BOOLEAN', true, Boolean)).to.equal(true);
        expect(environment.get('BOOLEAN', false, Boolean)).to.equal(false);

        //return a 'truthy' value as true
        expect(environment.get('BOOLEAN', {}, Boolean)).to.equal(true);
        expect(environment.get('BOOLEAN', [], Boolean)).to.equal(true);

        //return a 'falsey' value as false
        expect(environment.get('BOOLEAN', null, Boolean)).to.equal(false);
        expect(environment.get('BOOLEAN', undefined, Boolean)).to.equal(false);

        //'true', 'yes', and 'on' return true
        environment.set('BOOLEAN', 'true');
        expect(environment.get('BOOLEAN', false, Boolean)).to.equal(true);
        environment.set('BOOLEAN', 'yes');
        expect(environment.get('BOOLEAN', false, Boolean)).to.equal(true);
        environment.set('BOOLEAN', 'on');
        expect(environment.get('BOOLEAN', false, Boolean)).to.equal(true);

        //strings representing numbers === 0 return false
        environment.set('BOOLEAN', '0');
        expect(environment.get('BOOLEAN', true, Boolean)).to.equal(false);
        environment.set('BOOLEAN', '00000000');
        expect(environment.get('BOOLEAN', true, Boolean)).to.equal(false);

        //strings representing numbers !== 0 return true
        environment.set('BOOLEAN', '1');
        expect(environment.get('BOOLEAN', false, Boolean)).to.equal(true);
        environment.set('BOOLEAN', '-1');
        expect(environment.get('BOOLEAN', false, Boolean)).to.equal(true);
        environment.set('BOOLEAN', '0.1');
        expect(environment.get('BOOLEAN', false, Boolean)).to.equal(true);
        environment.set('BOOLEAN', '123456789');
        expect(environment.get('BOOLEAN', false, Boolean)).to.equal(true);

        //random strings (i.e. 'asdf', 'false') return false
        environment.set('BOOLEAN', 'false');
        expect(environment.get('BOOLEAN', true, Boolean)).to.equal(false);
        environment.set('BOOLEAN', 'ujelly');
        expect(environment.get('BOOLEAN', true, Boolean)).to.equal(false);
      });
    });
  });
  describe('.key()', () => {
    it('gets all keys set', () => {
      expect(environment.keys()).to.eql(keys);
    });
  });
  describe('.save()', () => {
    it('saves a file', (done) => {
      environment.save(filepath, (err, data) => {
        expect(err).to.equal(null);
        expect(() => data = JSON.parse(data)).to.not.throw();
        expect(data).to.eql(env);
        done();
      });
    });
  });
  describe('.load()', () => {
    it('invoked without a callback loads a file synchronously', () => {
      environment.load(filepath);
      expect(environment.keys()).to.eql(keys);
    });
    it('invoked with a callback loads a file asynchronously', (done) => {
      environment.load(filepath, (err, loadedKeys) => {
        expect(err).to.equal(null);
        expect(loadedKeys).to.eql(keys);
        expect(loadedKeys).to.eql(environment.keys());
        done();
      });
    });
    it('fails when given a bad filepath', (done) => {
      expect(() => environment.load(undefined)).to.throw();
      expect(() => environment.load(null)).to.throw();
      expect(() => environment.load(true)).to.throw();
      expect(() => environment.load(0)).to.throw();
      environment.load('//', (err, loadedKeys) => {
        expect(err).to.be.an('error');
        expect(loadedKeys).to.equal(null);
        done();
      });
    });
  });
  after(() => {
    fs.unlinkSync(filepath);
  });
});
