'use strict';

const spawn = require('child_process').spawn,
      fs   = require('fs'),
      config = require('./lib/config'),
      log  = (...args) => console.log(...args);

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
    if (!fs.existsSync(`${config.default_dir}`)) fs.mkdirSync(`${config.default_dir}`);

    log(`Tests registered: ${Object.keys(this.tests).length} ...\n`);
    log(`Running all tests ...\n`);

    const script = writeTestScript(this);

    fs.writeFileSync(`${config.default_dir}/${config.default_sh}`, script);

    const child = spawn('bash', [`${config.default_dir}/${config.default_sh}`], {stdio: 'inherit'});
    child.on('exit', process.exit);
  }
}

/**
 *
 * Outsource tests to a shell script
 */

 function writeTestScript (app) {
   const cmds = [];

   cmds.push(`${config.default_commands.clean_up}`);
   cmds.push(...app.beforeTasks);

   for (let test in app.tests) {
     cmds.push(...app.beforeEachTasks);
     cmds.push(`echo ${test} >> ${config.default_dir}/${config.default_output}; echo 'Running ${test} test'`);

     // loadtest
     if (app.loadtest_path) {
       cmds.push(`${app.tests[test]} & sleep 2`);
       cmds.push(`${app.loadtest_path} | grep "Time taken for tests:" >> ${config.default_dir}/${config.default_output}`);
       cmds.push(`${config.default_commands.kill_node} & sleep 2`);
       cmds.push(`${config.default_commands.process_node_logs} > ${config.default_dir}/profile-${test}.txt && rm ./isolate-*`);

    // time
     } else {
       cmds.push('NOW=`date +%s%N`');
       cmds.push(`${app.tests[test]}`);
       cmds.push('THEN=`date +%s%N`');
       cmds.push('DIFF=`expr $THEN - $NOW`');
       cmds.push('MILLIS=`expr $DIFF / 1000000`');
       cmds.push(`echo $MILLIS ms >> ${config.default_dir}/${config.default_output}`)
       cmds.push(`${config.default_commands.process_node_logs} > ${config.default_dir}/profile-${test}.txt && rm ./isolate-*`);
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
    return `${config.loadtest.program} ${options}`;
  }

  // - otherwise, obj
  options = only(options, config.loadtest.available_opts);
  if (validLoadOpts(options)) {
    return loadOptsToString(options);
  } else {
    throw Error('ConfigureError: loadtest options are missing required params');
  }
}

function validLoadOpts (options) {
  if (options.post && !options.type || options.put && !options.type) {
    return false;
  } else if (options.headers && typeof options.headers !== 'object'){
    return false;
  } else {
    return options.concurrency && options.requests && options.target;
  }
}

function loadOptsToString (options) {
  let o = [config.loadtest.program];

  for (let opt in options) {
    if (typeof options[opt] === 'object') {
      // nested options
      let params = options[opt];
      for (let p in params) {
        o.push(`${config.loadtest.bindings[opt]} "${p}:${params[p]}"`);
      }
    } else if (opt !== 'target') {
      // flat options
      o.push(`${config.loadtest.bindings[opt]} ${options[opt]}`);
    }
  }

  o.push(options.target);

  return o.join(' ');
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
