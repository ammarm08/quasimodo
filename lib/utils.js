'use strict';

const config = require('./config'),
      fs = require('fs'),
      assert = require('assert'),
      spawn = require('child_process').spawn;

const utils = module.exports = exports = {};

// Platform specific dependencies
if (process.platform !== 'linux') {
  config.clock.program = 'gtime --verbose';
  config.default_commands.check_dependencies += '\n' + config.functions.checkDependency('gtime');
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
  assert(script, `ScriptError: Script must be a string`);
  assert(typeof script === 'string', `ScriptError: Script must be a string`);
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

   // executable
   cmds.push('#!/bin/bash \n');

   cmds.push('# Import path, check "time" and "loadtest" dependencies, and cleanup test directory. Run before-hooks');
   cmds.push(`${config.default_commands.path_import}`);
   cmds.push(`${config.default_commands.check_dependencies}`);
   cmds.push(`${config.default_commands.testdir_cleanup} \n`);
   cmds.push(...app.beforeTasks);
   cmds.push('\n');

   for (let test in app.tests) {
     cmds.push(`# TEST RUNNING: ${test}.`)
     cmds.push(`echo ${test} >> ${config.default_dir}/${config.default_output}; echo 'Running ${test} test'`);
     cmds.push(...app.beforeEachTasks);

     if (app.loadtest_path) {
       cmds.push('# Start NodeJS process and run load-tester. Dump memory trace to file. Redirect loadtest results to file. Kill process.');
       cmds.push(`${app.tests[test]} > ${config.default_dir}/memory-${test}.txt &\n${config.default_commands.get_pid}`);
       cmds.push(`${config.default_commands.sleep}`);
       cmds.push(`${app.loadtest_path} | tee -a ${config.default_dir}/${config.default_output}`);
       cmds.push(`${config.default_commands.kill_node} & ${config.default_commands.sleep}`);
     } else {
       cmds.push('# Start NodeJS process and time how long it takes. Dump memory trace to file.');
       cmds.push(`${config.clock.program} --append --output=${config.default_dir}/${config.default_output} ${app.tests[test]} > ${config.default_dir}/memory-${test}.txt`);
     }

     cmds.push('# Process CPU profiling dump. Run afterEach-hooks');
     cmds.push(`${config.default_commands.process_node_logs} > ${config.default_dir}/cpu-${test}.txt && rm -rf ./isolate-* \n`);
     cmds.push(...app.afterEachTasks);
     cmds.push('\n');
   }

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

  assert(options, 'ConfigureError: loadtest options must be object or string');
  assert(type === 'string' || type === 'object', 'ConfigureError: loadtest options must be object or string');
  assert(!Array.isArray(options), 'ConfigureError: loadtest options must be object or string');

  if (type === 'string') {
    return `${config.loadtest.program} ${options}`;
  }

  // sanitize + validate options, then build command string from options

  if (utils.hasRequiredFields(options) && utils.hasWhitelistedOnly(options)) {
    return utils.loadOptsToString(options);
  }
}

utils.hasRequiredFields = function hasRequiredFields (options = {}) {
  const validHeaders = !(options.headers && typeof options.headers !== 'object');
  const validCookies = !(options.cookies && typeof options.cookies !== 'object');
  const hasRequired = !!(options.concurrency && options.requests && options.target);

  assert(hasRequired && validHeaders && validCookies, 'ConfigureError: loadtest options are missing required params');
  return true;
}

utils.hasWhitelistedOnly = function hasWhitelistedOnly (options = {}) {
  for (let opt in options) {
    assert(opt in config.loadtest.bindings, `ConfigureError: loadtest options contain invalid parameter(s): ${opt}`);
  }

  return true;
}

utils.loadOptsToString = function loadOptsToString (options = {}) {
  const tokens = Object.keys(options).reduce((memo, opt) => {
    // multiple options -> -H "X-Some-Header:some-val" -H "X-Some-Other-Header:some-other-val"
    if (typeof options[opt] === 'object') {
      return memo.concat(Object.keys(options[opt]).map(p => `${config.loadtest.bindings[opt]} "${p}:${options[opt][p]}"`));
    }

    // boolean options (only if true) -> -k
    if (options[opt] && typeof options[opt] === 'boolean') {
      return memo.concat(`${config.loadtest.bindings[opt]}`);
    }

    // -c 8 -n 50 etc
    if (typeof options[opt] !== 'boolean' && opt !== 'target') {
      return memo.concat(`${config.loadtest.bindings[opt]} ${options[opt]}`);
    }

    // otherwise
    return memo;
  }, [config.loadtest.program]);

  tokens.push(options.target); // ex. 'some-url.com'

  return tokens.join(' '); // ex. 'loadtest -c 8 -n 50 some-url.com'
}
