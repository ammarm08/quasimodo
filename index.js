'use strict';

const utils = require('./lib/utils'),
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

  registerTest: function registerTest (name, path, flags, args = '') {
    if ((typeof name && typeof path && typeof path && typeof args) !== 'string') {
      throw Error('RegisterError: name/path/flags/args must each be strings');
    }

    if (this.tests[name] !== undefined) {
      throw Error(`RegisterError: a test with name '${name}' has previously been registered`);
    }

    this.tests[name] = `node --prof ${flags} ${path} ${args}`;
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
    utils.mkdirIfNecessary();

    log(`Tests registered: ${Object.keys(this.tests).length} ...\n`);
    log(`Running all tests ...\n`);

    const script = utils.writeTestScript(this);
    utils.runScript(script);
  }
}
