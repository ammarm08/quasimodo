'use strict';

const proto = require('../index');

/**
 *
 * Testing the functionality of Quasimodo API
 *
 */

describe('Registering Tests: ', () => {
  describe('##registerTest: ', () => {
    let app = Object.assign({}, proto);

    it ('should require a test name and a test path', done => {
      (function registerNothing() { app.registerTest() }).should.throw();
      (function registerJustName() { app.registerTest('Test') }).should.throw();
      (function registerJustPath() { app.registerTest(undefined, 'path.js') }).should.throw();

      done();
    });

    it ('should not accept non-string parameters', done => {
      (function registerIntName () { app.registerTest(5, 'path.js', '--flags', '0') }).should.throw();
      (function registerIntPath () { app.registerTest('name', 5, '--flags', '0') }).should.throw();
      (function registerIntFlags () { app.registerTest('name', 'path.js', 5, '0') }).should.throw();
      (function registerIntArgs () { app.registerTest('name', 'path.js', '--flags', 5) }).should.throw();

      (function registerArrName () { app.registerTest([], 'path.js', '--flags', '0') }).should.throw();
      (function registerArrPath () { app.registerTest('name', [], '--flags', '0') }).should.throw();
      (function registerArrFlags () { app.registerTest('name', 'path.js', [], '0') }).should.throw();
      (function registerArrArgs () { app.registerTest('name', 'path.js', '--flags', []) }).should.throw();

      (function registerObjName () { app.registerTest({}, 'path.js', '--flags', '0') }).should.throw();
      (function registerObjPath () { app.registerTest('name', {}, '--flags', '0') }).should.throw();
      (function registerObjFlags () { app.registerTest('name', 'path.js', {}, '0') }).should.throw();
      (function registerObjArgs () { app.registerTest('name', 'path.js', '--flags', {}) }).should.throw();

      (function registerFnName () { app.registerTest(function () {}, 'path.js', '--flags', '0') }).should.throw();
      (function registerFnPath () { app.registerTest('name', function () {}, '--flags', '0') }).should.throw();
      (function registerFnFlags () { app.registerTest('name', 'path.js', function () {}, '0') }).should.throw();
      (function registerFnArgs () { app.registerTest('name', 'path.js', '--flags', function () {}) }).should.throw();

      done();
    });

    it ('should not accept a multi-word test name', done => {
      (function multiWordTest () { app.registerTest('Two Words', 'path.js') }).should.throw();
      (function multiWordTest () { app.registerTest('These Three Words', 'path.js') }).should.throw();

      done();
    });

    it ('should not accept duplicate test names', done => {
      app.registerTest('First', 'path.js');
      (function duplicateTest () { app.registerTest('First', 'path2.js') }).should.throw();
      done();
    });

    it ('should map test name with full test script as value', done => {
      app.tests['First'].should.equal('node --prof path.js');

      app.registerTest('Second', 'path2.js', '--some-flags=0', 'foo');
      app.tests['Second'].should.equal('node --prof --some-flags=0 path2.js foo');

      done();
    });
  });
});

// describe('Configuring Test Runner: ', () => {
//   describe('##configure: ', () => {
//     it ('should not accept non-Object parameter', done => {
//
//     });
//
//     it ('should accept a String as a loadtest option', done => {
//
//     });
//
//     it ('should accept an Object as a loadtest option', done => {
//
//     });
//
//     it ('should update loadtest_path upon successful loadtest configuration', done => {
//
//     });
//   });
// });
//
// describe('Adding Hooks to Tests', () => {
//   describe('##before: ', done => {
//     it ('should reject a non-String hook', done => {
//
//     });
//
//     it ('should add valid hook to beforeTasks', done => {
//
//     });
//   });
//
//   describe('##after: ', done => {
//     it ('should reject a non-String hook', done => {
//
//     });
//
//     it ('should add valid hook to afterTasks', done => {
//
//     });
//   });
//
//   describe('##beforeEach: ', done => {
//     it ('should reject a non-String hook', done => {
//
//     });
//
//     it ('should add valid hook to beforeEachTasks', done => {
//
//     });
//   });
//
//   describe('##afterEach: ', done => {
//     it ('should reject a non-String hook', done => {
//
//     });
//
//     it ('should add valid hook to afterEachTasks', done => {
//
//     });
//   });
// });

describe('Running Tests', () => {
  // describe('##run: ', done => {
  // TBD
  // });
});
