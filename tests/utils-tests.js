'use strict';

const utils = require('../lib/utils');

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
      (function cleanObj () { utils.only({}, []); }).should.not.throw();
      done();
    });

    it ('should only accept an array as a second parameter', done => {
      (function undefinedArr () { utils.only({}, undefined); }).should.throw();
      (function stringArr () { utils.only({}, ''); }).should.throw();
      (function intArr () { utils.only({}, 5); }).should.throw();
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
