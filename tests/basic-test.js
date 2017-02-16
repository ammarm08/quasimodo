'use strict';

const proto = require('../index');

/**
 *
 * Testing the functionality of Quasimodo API
 *
 */

describe('Registering Tests: ', () => {
  const app = Object.assign({}, proto);

  describe('##registerTest: ', () => {
    it ('should require an options Object', done => {
      (function registerNothing() { app.registerTest() }).should.throw();
      (function registerJustName() { app.registerTest('Test') }).should.throw();
      (function registerJustPath() { app.registerTest(5) }).should.throw();
      (function registerJustPath() { app.registerTest(function () {}) }).should.throw();
      (function registerJustPath() { app.registerTest([]) }).should.throw();

      done();
    });

    it ('should require a "name" parameter', done => {
      (function registerIntName () { app.registerTest({path: './some_path.js'}) }).should.throw();
      done();
    });

    it ('should not accept a "name" parameter that is not a string', done => {
      (function undefinedName () { app.registerTest({ name: undefined }) }).should.throw();
      (function intName () { app.registerTest({ name: 5 }) }).should.throw();
      (function arrName () { app.registerTest({ name: [] }) }).should.throw();
      (function fnName () { app.registerTest({ name: function () {} }) }).should.throw();
      (function objName () { app.registerTest({ name: {} }) }).should.throw();
      done();
    });

    it ('should require a "path" parameter', done => {
      (function registerIntName () { app.registerTest({name: 'Test_name'}) }).should.throw();
      done();
    });

    it ('should not accept a "path" parameter that is not a string', done => {
      (function undefinedPath () { app.registerTest({ path: undefined }) }).should.throw();
      (function intPath () { app.registerTest({ path: 5 }) }).should.throw();
      (function arrPath () { app.registerTest({ path: [] }) }).should.throw();
      (function fnPath () { app.registerTest({ path: function () {} }) }).should.throw();
      (function objPath () { app.registerTest({ path: {} }) }).should.throw();
      done();
    });

    it ('should require a "flags" parameter to be a list of strings if it is passed', done => {
      (function registerFlagAsNonArray () {
        app.registerTest({name: 'Test_Name', path: './some_path.js', flags: 'string'});
        app.registerTest({name: 'Test_Name', path: './some_path.js', flags: 5});
        app.registerTest({name: 'Test_Name', path: './some_path.js', flags: {}});
        app.registerTest({name: 'Test_Name', path: './some_path.js', flags: function () {}});
      }).should.throw();

      (function registerFlagAsNonStringArray () {
        app.registerTest({name: 'Test_Name', path: './some_path.js', flags: ['string', 5]});
        app.registerTest({name: 'Test_Name', path: './some_path.js', flags: ['string', {}]});
        app.registerTest({name: 'Test_Name', path: './some_path.js', flags: ['string', function () {}]});
      }).should.throw();

      done();
    });

    it ('should register a test with a custom flags if a flags option is passed', done => {
      const custom_flags = ['--v8', '--tweaks'];
      app.registerTest({name: 'customFlags', path: './customFlagsPath.js', flags: custom_flags});
      app.tests['customFlags'].should.equal(`${process.execPath} --prof ${custom_flags.join(' ')} ./customFlagsPath.js`);
      done();
    });

    it ('should require a "args" parameter to be a list of strings if it is passed', done => {
      (function registerFlagAsNonArray () {
        app.registerTest({name: 'Test_Name', path: './some_path.js', args: 'string'});
        app.registerTest({name: 'Test_Name', path: './some_path.js', args: 5});
        app.registerTest({name: 'Test_Name', path: './some_path.js', args: {}});
        app.registerTest({name: 'Test_Name', path: './some_path.js', args: function () {}});
      }).should.throw();

      (function registerFlagAsNonStringArray () {
        app.registerTest({name: 'Test_Name', path: './some_path.js', args: ['string', 5]});
        app.registerTest({name: 'Test_Name', path: './some_path.js', args: ['string', {}]});
        app.registerTest({name: 'Test_Name', path: './some_path.js', args: ['string', function () {}]});
      }).should.throw();

      done();
    });

    it ('should register a test with a custom args if an args option is passed', done => {
      const custom_args = ['4', '5'];
      app.registerTest({name: 'customArgs', path: './customArgsPath.js', args: custom_args});
      app.tests['customArgs'].should.equal(`${process.execPath} --prof ./customArgsPath.js ${custom_args.join(' ')}`);
      done();
    });

    it ('should set the process.execPath as the default node binary if no binary option is passed', done => {
      app.registerTest({name: 'someTest', path: './someTestPath'});
      app.tests['someTest'].should.equal(process.execPath + ' --prof ./someTestPath');
      done();
    });

    it ('should not accept a non-String binary option if passed', done => {
      (function intBinary () { app.registerTest({name: 'test', path: 'path.js', binary: 5}) }).should.throw();
      (function arrBinary () { app.registerTest({name: 'test', path: 'path.js', binary: []}) }).should.throw();
      (function objBinary () { app.registerTest({name: 'test', path: 'path.js', binary: {}}) }).should.throw();
      (function fnBinary () { app.registerTest({name: 'test', path: 'path.js', binary: function () {}}) }).should.throw();
      done();
    });

    it ('should register a test with a custom binary if a binary option is passed', done => {
      app.registerTest({name: 'customBinary', path: './customBinaryPath.js', binary: '/usr/bin/node'});
      app.tests['customBinary'].should.equal('/usr/bin/node --prof ./customBinaryPath.js');
      done();
    });

    it ('should require a "env" parameter to be a list of strings if it is passed', done => {
      (function registerFlagAsNonArray () {
        app.registerTest({name: 'Test_Name', path: './some_path.js', env: 'string'});
        app.registerTest({name: 'Test_Name', path: './some_path.js', env: 5});
        app.registerTest({name: 'Test_Name', path: './some_path.js', env: {}});
        app.registerTest({name: 'Test_Name', path: './some_path.js', env: function () {}});
      }).should.throw();

      (function registerFlagAsNonStringArray () {
        app.registerTest({name: 'Test_Name', path: './some_path.js', env: ['string', 5]});
        app.registerTest({name: 'Test_Name', path: './some_path.js', env: ['string', {}]});
        app.registerTest({name: 'Test_Name', path: './some_path.js', env: ['string', function () {}]});
      }).should.throw();

      done();
    });

    it ('should register a test with custom environment variables if env option is passed', done => {
      const env_var = 'NODE_ENV=test';

      app.registerTest({name: 'customEnv', path: './customEnv.js', env: [env_var]});
      app.tests['customEnv'].should.equal(`${process.execPath} ${env_var} --prof ./customEnv.js`);
      done();
    });

    it ('should not accept a multi-word test name', done => {
      (function multiWordTest () { app.registerTest({name: 'Two Words', path: 'path.js'}) }).should.throw();
      (function multiWordTest () { app.registerTest({name: 'These Three Words', path: 'path.js'}) }).should.throw();

      done();
    });

    it ('should not accept duplicate test names', done => {
      app.registerTest({name: 'First', path: 'path.js'});
      (function duplicateTest () {app.registerTest({name: 'First', path: 'path2.js'}) }).should.throw();
      done();
    });

    it ('should map test name with full test script as value', done => {
      app.tests['First'].should.equal(process.execPath + ' --prof path.js');

      app.registerTest({name: 'Second', path: 'path2.js', flags: ['--some-flags=0'], args: ['foo']});
      app.tests['Second'].should.equal(process.execPath + ' --prof --some-flags=0 path2.js foo');

      done();
    });
  });
});

describe('Configuring Test Runner: ', () => {
  const app = Object.assign({}, proto);

  describe('##configure: ', () => {
    it ('should not accept non-Object parameter', done => {
      (function configureUndefined () { app.configure(); }).should.throw();
      (function configureString () { app.configure('string'); }).should.throw();
      (function configureInteger () { app.configure(5); }).should.throw();
      (function configureArr () { app.configure([]); }).should.throw();
      (function configureFn () { app.configure(function () {}); }).should.throw();
      done();
    });

    it ('should accept a String as a loadtest option', done => {
      (function loadtestConfigureString () {
        app.configure({
          loadtest: '-c 2 -n 50 http://localhost:3000'
        })
      }).should.not.throw();
      done();
    });

    it ('should accept an Object as a loadtest option', done => {
      (function loadtestConfigureObj () {
        app.configure({
          loadtest: {
            concurrency: 2,
            requests: 50,
            target: 'http://localhost:3000'
          }
        })
      }).should.not.throw();

      done();
    });

    it ('should update loadtest_path upon successful loadtest configuration', done => {
      app.configure({
        loadtest: {
          concurrency: 5,
          requests: 100,
          postFile: '$FILE',
          type: 'application/json',
          target: 'http://localhost:8080'
        }
      });

      app.loadtest_path.should.not.equal('');
      done();
    });
  });
});

describe('Adding Hooks to Tests', () => {
  const app = Object.assign({}, proto);
  let task = 'echo YO';

  describe('##before: ', done => {
    it ('should reject a non-String hook', done => {
      (function integerCmd () { app.before(5); }).should.throw();
      (function arrCmd () { app.before([]); }).should.throw();
      (function objCmd () { app.before({}); }).should.throw();
      (function fnCmd () { app.before(function () {}); }).should.throw();
      done();
    });

    it ('should add valid hook to beforeTasks', done => {
      app.before(task);
      app.beforeTasks.includes(task).should.equal(true);
      done();
    });
  });

  describe('##after: ', done => {
    it ('should reject a non-String hook', done => {
      (function integerCmd () { app.after(5); }).should.throw();
      (function arrCmd () { app.after([]); }).should.throw();
      (function objCmd () { app.after({}); }).should.throw();
      (function fnCmd () { app.after(function () {}); }).should.throw();
      done();
    });

    it ('should add valid hook to afterTasks', done => {
      app.after(task);
      app.afterTasks.includes(task).should.equal(true);
      done();
    });
  });

  describe('##beforeEach: ', done => {
    it ('should reject a non-String hook', done => {
      (function integerCmd () { app.beforeEach(5); }).should.throw();
      (function arrCmd () { app.beforeEach([]); }).should.throw();
      (function objCmd () { app.beforeEach({}); }).should.throw();
      (function fnCmd () { app.beforeEach(function () {}); }).should.throw();
      done();
    });

    it ('should add valid hook to beforeEachTasks', done => {
      app.beforeEach(task);
      app.beforeEachTasks.includes(task).should.equal(true);
      done();
    });
  });

  describe('##afterEach: ', done => {
    it ('should reject a non-String hook', done => {
      (function integerCmd () { app.afterEach(5); }).should.throw();
      (function arrCmd () { app.afterEach([]); }).should.throw();
      (function objCmd () { app.afterEach({}); }).should.throw();
      (function fnCmd () { app.afterEach(function () {}); }).should.throw();
      done();
    });

    it ('should add valid hook to afterEachTasks', done => {
      app.afterEach(task);
      app.afterEachTasks.includes(task).should.equal(true);
      done();
    });
  });
});

// TODO: automate actual ##run of Quasimodo scripts
