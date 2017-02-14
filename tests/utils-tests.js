'use strict';

const utils = require('../lib/utils'),
      config = require('../lib/config');

/**
 *
 * Testing the functionality of utility functions
 *
 */

// describe('Writing & Running Scripts: ', () => {
//   describe('##runScript: ', () => {
//     it ('should throw error if no input provided', done => {
//
//     });
//
//     it ('should throw error if input is not a string', done => {
//
//     });
//
//     it ('should write script to file', done => {
//
//     });
//
//     it ('should spawn a child process to run the script', done => {
//
//     });
//   });
//
//   describe('##writeTestScript: ', () => {
//     it ('should throw error if no input provided', done => {
//
//     });
//
//     it ('should throw error if input is not the Quasimodo application', done => {
//
//     });
//
//     it ('should return a newline-delimited string', done => {
//
//     });
//
//     it ('should return a string that contains all before/clean-up/platform-check tasks', done => {
//
//     });
//
//     it ('should return a string that contains all beforeEach tasks', done => {
//
//     });
//
//     it ('should return a string that contains all afterEach tasks', done => {
//
//     });
//
//     it ('should return a string that contains all after tasks', done => {
//
//     });
//
//     it ('should return a string that contains all necessary test glue code (loadtest)', done => {
//
//     });
//
//     it ('should return a string that contains all necessary test glue code (no loadtest)', done => {
//
//     });
//   });
//
//   describe('##mkdirIfNecessary: ', () => {
//     it ('should create the target directory if the directory doesnt yet exist', done => {
//
//     });
//
//     it ('should not create a new directory if the target directory already exists', done => {
//
//     });
//   });
// });

describe('Parsing & Validating Parameters:', () => {
  describe('##parseLoadTest: ', () => {

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
