'use strict';

const utils = require('./utils'),
      assert = require('assert'),
      log  = (...args) => console.log(...args);

const quasimodo = module.exports = {
  prof_flags: '--prof -trace-gc -trace-gc-verbose',

  tests: {},

  beforeTasks: [],
  beforeEachTasks: [],
  afterTasks: [],
  afterEachTasks: [],

  loadtest_path: '',

  before: function before (cmd = '') {
    addTask(this, 'before', cmd);
  },

  after: function after (cmd = '') {
    addTask(this, 'after', cmd);
  },

  beforeEach: function beforeEach (cmd = '') {
    addTask(this, 'beforeEach', cmd);
  },

  afterEach: function afterEach (cmd = '') {
    addTask(this, 'afterEach', cmd);
  },

  registerTest: function registerTest (options) {
    // validating required params

    assert(options, 'RegisterError: param must be an options Object');
    assert(typeof options === 'object', 'RegisterError: param must be an options Object');
    assert(!Array.isArray(options), 'RegisterError: param must be an options Object');

    assert(options.path, 'RegisterError: options must include a "path" attribute to identity the path to the test script');
    assert(options.name, 'RegisterError: options must include a "name" attribute to identify test with');

    options.name = options.name.trim();
    assert(!options.name.includes(' '), `RegisterError: test name '${options.name}' contains whitespace`);
    assert(!this.tests[options.name], `RegisterError: a test with name '${options.name}' has previously been registered`);

    // validating optional params

    const flags = options.flags && isArrayOfStrings(options.flags, 'flags') ? options.flags : [''];
    const args = options.args && isArrayOfStrings(options.args, 'args') ? options.args : [''];
    const env_vars = options.env && isArrayOfStrings(options.env, 'env') ? options.env : [''];
    const binary = options.binary && validBinaryPath(options.binary) ? options.binary : process.execPath; // default: current process's execution path

    // registering test (remove extra white space)

    this.tests[options.name] = `${binary} ${env_vars.join(' ')} ${this.prof_flags} ${flags.join(' ')} ${options.path} ${args.join(' ')}`.replace(/  +/g, ' ').trim();
  },

  configure: function configure (options) {
    // validating required params

    assert(options, 'ConfigureError: options must be an object');
    assert(typeof options === 'object', 'ConfigureError: options must be an object');
    assert(!Array.isArray(options), 'ConfigureError: options must be an object');

    // currently, Quasimodo only supports `loadtest` as a configuration param

    if (options.loadtest) {
      this.loadtest_path = utils.parseLoadTest(options.loadtest);
    }
  },

  run: function () {
    // only run tests if there are tests actually registered to run

    const num_tests = Object.keys(this.tests).length;
    assert.notEqual(num_tests, 0, 'RegisterError: no tests were registered to run');

    log(`Tests registered: ${num_tests} ...\n`);
    log(`Running all tests ...\n`);

    // write shell script to file, then spawn child process to run this script

    const script = utils.buildScriptFromOptions(this);

    utils.writeScriptToFile(script);
    utils.runScript();
  }
}

/**
 *
 * Helper Functions
 *
 */

function addTask (app, hook, cmd) {
  assert(typeof cmd === 'string', 'HookError: Command must be a string');

  app[`${hook}Tasks`].push(cmd);
}

function isArrayOfStrings (list, attribute) {
  assert(Array.isArray(list), `RegisterError: if passing ${attribute} options, they must be represented as an array of strings`);

  for (let el of list) {
    assert(typeof el === 'string', `RegisterError: if passing ${attribute} options, they must be represented as an array of strings`);
  }

  return true;
}

function validBinaryPath (binary) {
  assert(typeof binary === 'string', `RegisterError: if passing custom node binary path, path must be a string`);
  return true;
}
