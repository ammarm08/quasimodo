'use strict';

const config = exports = module.exports = {
  default_dir: './quasimodo_tests',
  default_sh: 'quasimodo.sh',
  default_output: 'results.txt',
  default_profiling: 'profile-*.txt'
};

config.functions = {
  checkDependency: function checkDependency (dep) {
    const map = {
      'ab': 'apt-get install apache2-utils',
      '$(npm bin)/loadtest': 'npm install',
      'gtime': 'brew install gnu-time'
    }

    return `command -v ${dep} >/dev/null 2>&1 || { echo >&2 "${dep} not installed. Please run ${map[dep]} to install, then try again. Exiting ... "; exit 1; }`;
  }
};

config.default_commands = {
  get_pid: 'NODE_PID=$!',
  kill_node: 'kill -9 $NODE_PID',
  sleep: 'sleep 5',
  process_node_logs: `node --prof-process ./isolate-*`,
  testdir_cleanup: `rm -rf ./isolate-* ${config.default_dir}/*.txt`,
  path_import: 'source ~/.bashrc && source ~/.profile && LOADTEST=$(npm bin)/loadtest',
  check_dependencies: config.functions.checkDependency('$(npm bin)/loadtest')
};

config.clock = {
  program: `/usr/bin/time -v`
};

config.loadtest = {
  program: '$LOADTEST',
  bindings: {
    'concurrency': '-c',
    'requests': '-n',
    'postFile': '-p',
    'postBody': '-P',
    'putFile': '-u',
    'patchFile': '-a',
    'patchBody': '-A',
    'data': '--data',
    'method': '-m',
    'type': '-T',
    'protocol': '-s',
    'headers': '-H',
    'cookies': '-C',
    'keepalive': '-k',
    'timelimit': '-t',
    'timeout': '--timeout',
    'insecure': '--insecure',
    'cert': '--cert',
    'key': '--key',
    'requests_per_second': '--rps',
    'target': ''
  }
};

config.loadtest.available_opts = Object.keys(config.loadtest.bindings);
