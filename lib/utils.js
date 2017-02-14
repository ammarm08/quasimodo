'use strict';

const config = require('./config'),
      fs = require('fs'),
      spawn = require('child_process').spawn;

const utils = module.exports = exports = {};

// Platform specific dependencies
if (process.platform === 'linux') {
  config.default_commands.checks = config.functions.check_deps('ab');
} else {
  config.loadtest.program = 'loadtest';
  config.clock.program = 'gtime --verbose';
  config.default_commands.checks = [config.functions.check_deps('loadtest'), config.functions.check_deps('gtime')].join('\n');
}

/**
 *
 * Spawn child to run file
 *
 */

utils.runScript = function runScript () {
  const child = spawn('bash', [`${config.default_dir}/${config.default_sh}`], {stdio: 'inherit'});
  child.on('exit', process.exit);
}

/**
 *
 * Given a newline-delimited string, write to file
 *
 */

utils.writeScriptToFile = function writeScriptToFile (script) {
  if (typeof script !== 'string') {
    throw Error('ScriptError: Script must be a string');
  }

  utils.mkdirIfNecessary();
  fs.writeFileSync(`${config.default_dir}/${config.default_sh}`, script);
}

/**
 *
 * If target test directory doesn't exist, write it.
 *
 */

utils.mkdirIfNecessary = function () {
  if (!fs.existsSync(`${config.default_dir}`)) {
    fs.mkdirSync(`${config.default_dir}`);
  }
}

/**
 *
 * Write string of commands to run from Quasimodo options
 *
 */

 utils.buildScriptFromOptions = function buildScriptFromOptions (app) {
   const cmds = [];

   // path setup + file cleanup + before-hooks
   cmds.push(`${config.default_commands.mac_path}`);
   cmds.push(`${config.default_commands.checks}`);
   cmds.push(`${config.default_commands.clean_up}`);
   cmds.push(...app.beforeTasks);
   cmds.push('\n');

   for (let test in app.tests) {
     // before-each hooks
     cmds.push(...app.beforeEachTasks);

     // descriptive test logging
     cmds.push(`echo ${test} >> ${config.default_dir}/${config.default_output}; echo 'Running ${test} test'`);

     // run tests
     if (app.loadtest_path) {
       cmds.push(`${config.clock.program} ${app.tests[test]} 2>> ${config.default_dir}/${config.default_output} & sleep 2`);
       cmds.push(`${app.loadtest_path} | grep "Time taken for tests:" >> ${config.default_dir}/${config.default_output}`);
       cmds.push(`${config.default_commands.kill_node} & sleep 2`);
     } else {
       cmds.push(`${config.clock.program} ${app.tests[test]} 2>> ${config.default_dir}/${config.default_output}`);
     }

     // process and clear logs
     cmds.push(`${config.default_commands.process_node_logs} > ${config.default_dir}/profile-${test}.txt && rm ./isolate-*`);

     // after-each hooks
     cmds.push(...app.afterEachTasks);
     cmds.push('\n');
   }

   // after-hooks
   cmds.push(...app.afterTasks);

   return cmds.join('\n');
 }

/**
 *
 * Configuration Parsing Functions
 *
 */

utils.parseLoadTest = function parseLoadTest (options) {
  const type = typeof options;

  if ((type !== 'string' && type !== 'object') || Array.isArray(options)) {
    throw Error('ConfigureError: loadtest options must be object or string');
  }

  if (type === 'string') {
    return `${config.loadtest.program} ${options}`;
  }

  // sanitize + validate options, then build command string from options
  options = utils.only(options, config.loadtest.available_opts);
  if (utils.validLoadOpts(options)) {
    return utils.loadOptsToString(options);
  } else {
    throw Error('ConfigureError: loadtest options are missing required params');
  }
}

utils.validLoadOpts = function validLoadOpts (options = {}) {
  const validData = !(options.post && !options.type || options.put && !options.type);
  const validHeaders = !(options.headers && typeof options.headers !== 'object');
  const hasRequired = !!(options.concurrency && options.requests && options.target);

  return hasRequired && validHeaders && validData;
}

utils.loadOptsToString = function loadOptsToString (options = {}) {
  let o = [config.loadtest.program];

  for (let opt in options) {
    // nested flags
    if (typeof options[opt] === 'object') {
      let params = options[opt];
      for (let p in params) {
        o.push(`${config.loadtest.bindings[opt]} "${p}:${params[p]}"`);
      }
    // boolean flags
    } else if (options[opt] && typeof options[opt] === 'boolean') {
      o.push(`${config.loadtest.bindings[opt]}`);
    // flat flags
    } else if (typeof options[opt] !== 'boolean' && opt !== 'target') {
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

utils.only = function only (obj = {}, permitted_keys = []) {
  return permitted_keys.reduce((memo, key) => {
    if (obj[key] && memo[key] === undefined) {
      memo[key] = obj[key];
    }

    return memo;
  }, {});
}
