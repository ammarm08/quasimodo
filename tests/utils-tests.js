'use strict';

const utils = require('../lib/utils'),
      config = require('../lib/config'),
      fs = require('fs'),
      exec = require('child_process').exec;

/**
 *
 * Testing the functionality of utility functions
 *
 */

describe('Writing & Running Scripts: ', () => {
  const script = 'echo hi';

  before(done => {
    utils.mkdirIfNecessary();
    done();
  });

  after(done => {
    exec(`rm -r ${config.default_dir}`, () => {
      done();
    })
  })

  describe('##writeScriptToFile: ', () => {
    it ('should throw error if no input provided', done => {
      (function noInput () { utils.writeScriptToFile(); }).should.throw();
      done();
    });

    it ('should throw error if input is not a string', done => {
      (function integerInput () { utils.writeScriptToFile(5); }).should.throw();
      (function arrInput () { utils.writeScriptToFile([]); }).should.throw();
      (function objInput () { utils.writeScriptToFile({}); }).should.throw();
      (function fnInput () { utils.writeScriptToFile(function () {}); }).should.throw();

      done();
    });

    it ('should write script to file', done => {
      utils.writeScriptToFile(script);
      fs.existsSync(`${config.default_dir}/${config.default_sh}`).should.equal(true);
      done();
    });
  });

  describe('##buildScriptFromOptions: ', () => {
    const testApp = {
      tests: {'Server': 'node someScript.js', 'Server2': 'node someOtherScript.js'},
      beforeTasks: ['echo RUNNING ALL TESTS'],
      afterTasks: ['echo DONE'],
      beforeEachTasks: ['echo TEST RUNNING'],
      afterEachTasks: ['echo TEST COMPLETE']
    }

    it ('should throw error if input is not an object', done => {
      (function integerInput () { utils.buildScriptFromOptions(); }).should.throw();
      (function integerInput () { utils.buildScriptFromOptions(5); }).should.throw();
      (function arrInput () { utils.buildScriptFromOptions([]); }).should.throw();
      (function stringInput () { utils.buildScriptFromOptions(''); }).should.throw();
      (function fnInput () { utils.buildScriptFromOptions(function () {}); }).should.throw();

      done();
    });

    it ('should return a string that contains all hooks', done => {
      const result = utils.buildScriptFromOptions(testApp);

      result.includes(testApp.tests['Server']).should.equal(true);
      result.includes(testApp.tests['Server2']).should.equal(true);
      result.includes(testApp.beforeTasks[0]).should.equal(true);
      result.includes(testApp.afterTasks[0]).should.equal(true);
      result.includes(testApp.beforeEachTasks[0]).should.equal(true);
      result.includes(testApp.afterEachTasks[0]).should.equal(true);

      done();
    });
  });
});

describe('Parsing & Validating Parameters:', () => {
  describe('##parseLoadTest: ', () => {
    const str = '-c 5 -n 500 http://localhost:3000';
    const expectedStr = `${config.loadtest.program} ${str}`;

    const opts = {
      concurrency: 5,
      requests: 50,
      post: '$TEST_FILE',
      type: 'application/json',
      target: 'http://localhost:3000'
    };
    const expectedFromOpts = `${config.loadtest.program} -c ${opts.concurrency} -n ${opts.requests} -p ${opts.post} -T ${opts.type} ${opts.target}`;

    it('should not accept an options parameter that is neither a string nor an object', done => {
      (function parseUndefined () { utils.parseLoadTest(); }).should.throw();
      (function parseInteger () { utils.parseLoadTest(5); }).should.throw();
      (function parseArray () { utils.parseLoadTest([]); }).should.throw();
      (function parseString () { utils.parseLoadTest(''); }).should.not.throw();
      (function parseObj () { utils.parseLoadTest({}); }).should.throw();
      (function parseObj () { utils.parseLoadTest(opts); }).should.not.throw();

      done();
    });

    it('should immediately return parsed output if input is a string', done => {
      utils.parseLoadTest('some string').should.be.a.String();
      utils.parseLoadTest(str).should.equal(expectedStr);
      done();
    });

    it('should parse options object and output a properly formatted string', done => {
      utils.parseLoadTest(opts).should.equal(expectedFromOpts);
      done();
    });
  });

  describe('##validLoadOpts: ', () => {
    const opts = {
      concurrency: 5,
      requests: 10,
      target: 'http://localhost:3000'
    };

    it('should not validate options if a Post is specified but a Type is not', done => {
      const invalid = Object.assign({}, opts, {post: '$FILE'});
      utils.validLoadOpts(invalid).should.equal(false);
      done();
    });

    it('should not validate options if a Put is specified but a Type is not', done => {
      const invalid = Object.assign({}, opts, {put: '$FILE'});
      utils.validLoadOpts(invalid).should.equal(false);
      done();
    });

    it('should not validate options if a Concurrency, Requests, or Target param is not specified', done => {
      utils.validLoadOpts({}).should.equal(false);

      utils.validLoadOpts({concurrency: opts.concurrency}).should.equal(false);
      utils.validLoadOpts({requests: opts.requests}).should.equal(false);
      utils.validLoadOpts({target: opts.target}).should.equal(false);

      utils.validLoadOpts({concurrency: opts.concurrency, requests: opts.requests}).should.equal(false);
      utils.validLoadOpts({requests: opts.requests, target: opts.target}).should.equal(false);
      utils.validLoadOpts({concurrency: opts.concurrency, target: opts.target}).should.equal(false);

      done();
    });

    it('should validate options that have all required params', done => {
      utils.validLoadOpts(opts).should.equal(true);
      utils.validLoadOpts(Object.assign({}, opts, {post: '$FILE', type: 'application/json'})).should.equal(true);
      utils.validLoadOpts(Object.assign({}, opts, {put: '$FILE', type: 'application/json'})).should.equal(true);
      done();
    });
  });

  describe('##loadOptsToString: ', () => {
    const opts = {
      concurrency: 5,
      requests: 50,
      post: '$TEST_FILE',
      type: 'application/json',
      target: 'http://localhost:3000'
    };

    const expected = `${config.loadtest.program} -c ${opts.concurrency} -n ${opts.requests} -p ${opts.post} -T ${opts.type} ${opts.target}`;

    it('should construct a loadtest string from flat flags', done => {
      utils.loadOptsToString(opts).should.equal(expected);
      done();
    });

    it('should construct a loadtest string from nested flags', done => {
      const nested = Object.assign({}, opts, {headers: {some_header: 'hi', some_other_header: 'bye'}});
      const res = utils.loadOptsToString(nested);

      res.includes('-H "some_header:hi"').should.equal(true);
      res.includes('-H "some_other_header:bye"').should.equal(true);
      done();
    });

    it('should construct a loadtest string from boolean flags', done => {
      const flagEnabled = Object.assign({}, opts, {keepalive: true});
      const flagDisabled = Object.assign({}, opts, {keepalive: false});

      const enabledRes = utils.loadOptsToString(flagEnabled);
      enabledRes.includes('-k').should.equal(true);

      const disabledRes = utils.loadOptsToString(flagDisabled);
      disabledRes.includes('-k').should.equal(false);

      done();
    });
  });

  describe('##only: ', () => {
    const obj = {
      name: 'Ammar',
      email: 'some@email.com',
      hometown: 'Potomac',
      school: 'Snobby U'
    };

    const expected = {
      name: 'Ammar',
      hometown: 'Potomac'
    };

    it('should return only whitelisted properties', done => {
      utils.only(obj, ['name', 'hometown']).should.deepEqual(expected);
      done();
    });

    it('should omit undefineds or non-string elements in list of permitted keys', done => {
      utils.only(obj, [undefined]).should.deepEqual({});
      utils.only(obj, ['name', undefined, 5, 'hometown']).should.deepEqual(expected);
      done();
    });
  });
});
