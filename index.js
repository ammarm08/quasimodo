'use strict';

const spawn = require('child_process').spawn,
      fs   = require('fs'),
      log  = (...args) => console.log(...args);

const DEFAULT_DIR = './quasimodo_tests',
      DEFAULT_SH = 'quasimodo.sh',
      DEFAULT_OUTPUT = 'results.txt',
      DEFAULT_PROFILING = 'profile-*.txt';

const LOADTEST_PROGRAM = 'ab',
      KILL_NODE = 'pgrep -n node | xargs kill',
      PROCESS_NODE_LOGS = `node --prof-process ./isolate-*`,
      CLEAN_UP = `rm ./isolate-* ${DEFAULT_DIR}/${DEFAULT_OUTPUT} ${DEFAULT_DIR}/${DEFAULT_PROFILING}`;

const quasimodo = module.exports = {
  tests: {},

  beforeTasks: [],
  beforeEachTasks: [],
  afterTasks: [],
  afterEachTasks: [],

  loadtest_path: '',

  configure: function configure (options = {}) {
    log('Configuring tests ...\n');
    for (let opt in options) {
      let v = options[opt];

      if (opt === 'loadtest') {
        this.loadtest_path = parseLoadTest(v);
      }
    }
  },

  registerTest: function registerTest (name, path, flags, args = '') {
    this.tests[name] = `node --prof ${flags} ${path} ${args}`;
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
    log(this.tests);
    if (!fs.existsSync(`${DEFAULT_DIR}`)) fs.mkdirSync(`${DEFAULT_DIR}`);

    log(`Tests registered: ${Object.keys(this.tests).length} ...\n`);
    log(`Running all tests ...\n`);

    const script = writeTestScript(this);

    fs.writeFileSync(`${DEFAULT_DIR}/${DEFAULT_SH}`, script);

    const child = spawn('bash', [`${DEFAULT_DIR}/${DEFAULT_SH}`], {stido: 'inherit'});
    child.on('exit', process.exit);
  }
}

/**
 *
 * Outsource tests to a shell script
 */

 function writeTestScript (app) {
   const cmds = [];

   cmds.push(`${CLEAN_UP}`);
   cmds.push(...app.beforeTasks);

   for (let test in app.tests) {
     cmds.push(...app.beforeEachTasks);
     cmds.push(`echo ${test} >> ${DEFAULT_DIR}/${DEFAULT_OUTPUT}; echo 'Running ${test} test'`);

     // loadtest
     if (app.loadtest_path) {
       cmds.push(`${app.tests[test]} & sleep 2`);
       cmds.push(`${app.loadtest_path} | grep "Time taken for tests:" >> ${DEFAULT_DIR}/${DEFAULT_OUTPUT}`);
       cmds.push(`${KILL_NODE} & sleep 2`);
       cmds.push(`${PROCESS_NODE_LOGS} > ${DEFAULT_DIR}/profile-${test}.txt && rm ./isolate-*`);

    // time
     } else {
       cmds.push('NOW=`date +%s%N`');
       cmds.push(`${app.tests[test]}`);
       cmds.push('THEN=`date +%s%N`');
       cmds.push('DIFF=`expr $THEN - $NOW`');
       cmds.push('MILLIS=`expr $DIFF / 1000000`');
       cmds.push(`echo $MILLIS ms >> ${DEFAULT_DIR}/${DEFAULT_OUTPUT}`)
       cmds.push(`${PROCESS_NODE_LOGS} > ${DEFAULT_DIR}/profile-${test}.txt && rm ./isolate-*`);
     }

     cmds.push(...app.afterEachTasks);
   }

   cmds.push(...app.beforeTasks);

   return cmds.join('\n');
 }

/**
 *
 * Configuration Parsing Functions
 *
 */

function parseLoadTest (options) {
  const type = typeof options;

  if (type !== 'string' && type !== 'object') {
    throw Error('ConfigureError: loadtest options must be object or string');
  }

  if (type === 'string') {
    return `${LOADTEST_PROGRAM} ${options}`;
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
  let o = `${LOADTEST_PROGRAM} -c ${options.concurrency} -n ${options.requests} `;

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
