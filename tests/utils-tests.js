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

    it('should only accept an object as a parameter', done => {
      (function undefinedOptions () { utils.loadOptsToString(); }).should.throw();
      (function stringOptions () { utils.loadOptsToString(''); }).should.throw();
      (function intOptions () { utils.loadOptsToString(5); }).should.throw();
      (function arrOptions () { utils.loadOptsToString([]); }).should.throw();
      (function cleanOptions () { utils.loadOptsToString({}); }).should.not.throw();
      done();
    });

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

    it('should only accept an object as a first parameter', done => {
      (function undefinedObj () { utils.only(undefined, []); }).should.throw();
      (function stringObj () { utils.only('', []); }).should.throw();
      (function intObj () { utils.only(5, []); }).should.throw();
      (function arrObj () { utils.only([], []); }).should.throw();
      (function cleanObj () { utils.only({}, []); }).should.not.throw();
      done();
    });

    it ('should only accept an array as a second parameter', done => {
      (function undefinedArr () { utils.only({}, undefined); }).should.throw();
      (function stringArr () { utils.only({}, ''); }).should.throw();
      (function intArr () { utils.only({}, 5); }).should.throw();
      (function objArr () { utils.only({}, {}); }).should.throw();
      (function cleanArr () { utils.only({}, []); }).should.not.throw();
      done();
    });

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
