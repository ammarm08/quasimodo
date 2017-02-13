'use strict';

const config = require('./config'),
      fs = require('fs'),
      spawn = require('child_process').spawn;

const utils = module.exports = exports = {};

/**
 *
 * Given a newline-delimited string, write to file then spawn child to run it
 *
 */

utils.runScript = function runScript (script) {
  if (typeof script !== 'string') {
    throw Error('ScriptError: Script must be a string');
  }

  fs.writeFileSync(`${config.default_dir}/${config.default_sh}`, script);

  const child = spawn('bash', [`${config.default_dir}/${config.default_sh}`], {stdio: 'inherit'});
  child.on('exit', process.exit);
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
 * Outsource tests to a shell script
 *
 */

 utils.writeTestScript = function writeTestScript (app) {
   const cmds = [];

   // prepare clean up commands and before hooks
   cmds.push(`${config.default_commands.clean_up}`);
   cmds.push(...app.beforeTasks);
   cmds.push('\n');

   for (let test in app.tests) {
     // prepare beforeEach hooks
     cmds.push(...app.beforeEachTasks);

     // log name of test about to run
     cmds.push(`echo ${test} >> ${config.default_dir}/${config.default_output}; echo 'Running ${test} test'`);

     // if loadtesting, run test and process profiling output
     if (app.loadtest_path) {
       cmds.push(`${app.tests[test]} & sleep 2`);
       cmds.push(`${app.loadtest_path} | grep "Time taken for tests:" >> ${config.default_dir}/${config.default_output}`);
       cmds.push(`${config.default_commands.kill_node} & sleep 2`);
       cmds.push(`${config.default_commands.process_node_logs} > ${config.default_dir}/profile-${test}.txt && rm ./isolate-*`);

    // otherwise, run test and output time differentials
     } else {
       cmds.push('NOW=`date +%s%N`');
       cmds.push(`${app.tests[test]}`);
       cmds.push('THEN=`date +%s%N`');
       cmds.push('DIFF=`expr $THEN - $NOW`');
       cmds.push('MILLIS=`expr $DIFF / 1000000`');
       cmds.push(`echo $MILLIS ms >> ${config.default_dir}/${config.default_output}`)
       cmds.push(`${config.default_commands.process_node_logs} > ${config.default_dir}/profile-${test}.txt && rm ./isolate-*`);
     }

     // prepare afterEach hooks
     cmds.push(...app.afterEachTasks);
     cmds.push('\n');
   }

   // prepare after hooks
   cmds.push(...app.beforeTasks);

   return cmds.join('\n');
 }

/**
 *
 * Configuration Parsing Functions
 *
 */

utils.parseLoadTest = function parseLoadTest (options) {
  const type = typeof options;

  if (type !== 'string' && type !== 'object') {
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

utils.validLoadOpts = function validLoadOpts (options) {
  if (options.post && !options.type || options.put && !options.type) {
    return false;
  } else if (options.headers && typeof options.headers !== 'object'){
    return false;
  } else {
    return options.concurrency && options.requests && options.target;
  }
}

utils.loadOptsToString = function loadOptsToString (options) {
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

utils.only = function only (obj, permitted_keys) {
  return permitted_keys.reduce((memo, key) => {
    if (obj[key] && memo[key] === undefined) {
      memo[key] = obj[key];
    }

    return memo;
  }, {});
}
