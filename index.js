'use strict';

const exec = require('child_process').exec,
      fs   = require('fs'),
      log  = (...args) => console.log(...args);

const quasimodo = module.exports = {
  tests: {},

  beforeTasks: [],
  beforeEachTasks: [],
  afterTasks: [],
  afterEachTasks: [],

  loadtest_path: '',
  output_path: './results.txt',

  configure: function configure (options = {}) {
    log('Configuring tests ...\n');
    for (let opt in options) {
      let v = options[opt];

      if (opt === 'loadtest') {
        this.loadtest_path = parseLoadTest(v);
      } else if (opt === 'output') {
        this.output_path = parseOutput(v);
      }
    }
  },

  registerTest: function registerTest (name, path, flags) {
    this.tests[name] = `node ${path} ${flags} --prof`;
  },

  before: function before (commands = []) {
    for (let cmd of commands) {
      // TBD: throw if not string
    }
  },

  after: function before (commands = []) {
    for (let cmd of commands) {
      // TBD: throw if not string
    }
  },

  beforeEach: function before (commands = []) {
    for (let cmd of commands) {
      // TBD: throw if not string
    }
  },

  afterEach: function before (commands = []) {
    for (let cmd of commands) {
      // TBD: throw if not string
    }
  },

  run: function () {
    // writeTestScript(this);
    log(`Tests registered: ${Object.keys(this.tests).length} ...\n`);
    log(`Running all tests ...\n`);

    log(`Running all pre-test tasks ...\n`);
    // TODO: run all pre-test tasks

    // exec('bash quasimodo-test.sh')

    // deleteTestScript();
    log(`DONE`);
  }
}

/**
 *
 * Outsource tests to a bash scripts
 */

 function writeTestScript (app) {
   // TODO: write to quasimodo-test.sh
   /*

   for b in before:
    output += parseCommand(b);

   for test in tests:
    for (b in beforEach):
      output += parseCommand(b)

    echo test name > results

    * if load test
      run test & sleep 2
      run mem/cpu stuff
      run loadtest | grep some stuff > write it to results
    * else
      time run test > write to results & sleep 2
      run mem/cpu stuff

    kill process
    
   */
 }

 function deleteTestScript () {
   // TODO: delete quasimodo-test.sh
 }

/**
 *
 * Configuration Parsing Functions
 *
 */

function parseOutput (opt) {
  if (typeof opt !== 'string') {
    throw Error('ConfigureError: output option must be a string');
  }

  return opt;
}

function parseLoadTest (options) {
  const type = typeof options;

  if (type !== 'string' && type !== 'object') {
    throw Error('ConfigureError: loadtest options must be object or string');
  }

  if (type === 'string') {
    return `loadtest ${options}`;
  }

  // - otherwise, obj
  options = only(options, ['concurrency', 'requests', 'post', 'type', 'target']);
  if (validLoadOpts(options)) {
    return loadOptsToString(options);
  } else {
    throw Error('ConfigureError: loadtest options are missing required params');
  }
}

function validLoadOpts (options) {
  return options.concurrency && options.requests && options.target;
}

function loadOptsToString (options) {
  let o = `loadtest -c ${options.concurrency} -n ${options.requests} `;

  if (options.post) {
    o += `-p ${options.post} `;
  }

  if (options.type) {
    o += `-T ${options.type} `;
  }

  o += options.target;

  return o;
}

/**
 *
 * Helper Functions
 *
 */

function only (obj, permitted_keys) {
  const sanitized = {};

  for (let x of permitted_keys) {
    if (obj[x] && sanitized[x] === undefined) {
      sanitized[x] = obj[x];
    }
  }

  return sanitized;
}
