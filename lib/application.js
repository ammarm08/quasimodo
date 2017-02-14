'use strict';

const utils = require('./utils'),
      log  = (...args) => console.log(...args);

const quasimodo = module.exports = {
  tests: {},

  beforeTasks: [],
  beforeEachTasks: [],
  afterTasks: [],
  afterEachTasks: [],

  loadtest_path: '',

  configure: function configure (options = {}) {
    for (let opt in options) {
      let v = options[opt];

      if (opt === 'loadtest') {
        this.loadtest_path = utils.parseLoadTest(v);
      }
    }
  },

  registerTest: function registerTest (name, path, flags = '', args = '') {
    if (typeof name !== 'string' || typeof path !== 'string') {
      throw Error('RegisterError: name/path are required, and each must be a string');
    }

    if (typeof flags !== 'string' || typeof args !== 'string') {
      throw Error('RegisterError: flags/args each must be a string if used');
    }

    if (this.tests[name] !== undefined) {
      throw Error(`RegisterError: a test with name '${name}' has previously been registered`);
    }

    name = name.trim();
    if (name.includes(' ')) {
      throw Error(`RegisterError: test '${name}' contains a space`);
    }

    // remove extra white space from final command ('node --prof   test.js' => 'node --prof test.js')
    this.tests[name] = `node --prof ${flags} ${path} ${args}`.replace(/  +/g, ' ').trim();
  },

  before: function before (cmd = '') {
    if (typeof cmd !== 'string') {
      throw Error('HookError: Command must be a string');
    }

    this.beforeTasks.push(cmd);
  },

  after: function after (cmd = '') {
    if (typeof cmd !== 'string') {
      throw Error('HookError: Command must be a string');
    }

    this.afterTasks.push(cmd);
  },

  beforeEach: function beforeEach (cmd = '') {
    if (typeof cmd !== 'string') {
      throw Error('HookError: Command must be a string');
    }

    this.beforeEachTasks.push(cmd);
  },

  afterEach: function afterEach (cmd = '') {
    if (typeof cmd !== 'string') {
      throw Error('HookError: Command must be a string');
    }

    this.afterEachTasks.push(cmd);
  },

  run: function () {
    log(`Tests registered: ${Object.keys(this.tests).length} ...\n`);
    log(`Running all tests ...\n`);

    const script = utils.buildScriptFromOptions(this);

    utils.writeScriptToFile(script);
    utils.runScript();
  }
}
