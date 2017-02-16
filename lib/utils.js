'use strict';

const config = require('./config'),
      fs = require('fs'),
      spawn = require('child_process').spawn;

const utils = module.exports = exports = {};

// Platform specific dependencies
if (process.platform !== 'linux') {
  config.clock.program = 'gtime --verbose';
  config.default_commands.checks += '\n' + config.functions.check_deps('gtime');
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

   // executable
   cmds.push('#!/bin/bash \n');

   // path setup + file cleanup + before-hooks
   cmds.push(`${config.default_commands.path_import}`);
   cmds.push(`${config.default_commands.check_dependencies}`);
   cmds.push(`${config.default_commands.testdir_cleanup}`);
   cmds.push(...app.beforeTasks);
   cmds.push('\n');

   for (let test in app.tests) {
     // before-each hooks
     cmds.push(...app.beforeEachTasks);

     // descriptive test logging
     cmds.push(`echo ${test} >> ${config.default_dir}/${config.default_output}; echo 'Running ${test} test'`);

     // run tests
     if (app.loadtest_path) {
       cmds.push(`${app.tests[test]} &\n${config.default_commands.get_pid}`);
       cmds.push(`${config.default_commands.sleep}`);
       cmds.push(`${app.loadtest_path} >> ${config.default_dir}/${config.default_output}`);
       cmds.push(`${config.default_commands.kill_node} & ${config.default_commands.sleep}`);
     } else {
       cmds.push(`${config.clock.program} ${app.tests[test]} 2>> ${config.default_dir}/${config.default_output}`);
     }

     // process and clear logs
     cmds.push(`${config.default_commands.process_node_logs} > ${config.default_dir}/profile-${test}.txt && rm -rf ./isolate-*`);

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

  if (utils.hasRequiredFields(options) && utils.hasWhitelistedOnly(options)) {
    return utils.loadOptsToString(options);
  }
}

utils.hasRequiredFields = function hasRequiredFields (options = {}) {
  const validHeaders = !(options.headers && typeof options.headers !== 'object');
  const validCookies = !(options.cookies && typeof options.cookies !== 'object');
  const hasRequired = !!(options.concurrency && options.requests && options.target);

  if (hasRequired && validHeaders && validCookies) {
    return true;
  } else {
    throw Error('ConfigureError: loadtest options are missing required params');
  }
}

utils.hasWhitelistedOnly = function hasWhitelistedOnly (options = {}) {
  for (let opt in options) {
    if (! (opt in config.loadtest.bindings)) {
      throw Error(`ConfigureError: loadtest options contain invalid parameter(s): ${opt}`);
    }
  }

  return true;
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
