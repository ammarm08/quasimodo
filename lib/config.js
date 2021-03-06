'use strict';

const config = module.exports = {
  default_dir: './quasimodo_tests',
  default_sh: 'quasimodo.sh',
  default_output: 'results.txt'
};

config.functions = {
  checkDependency: function checkDependency (dep) {
    const map = {
      'ab': 'apt-get install apache2-utils',
      '$(npm bin)/loadtest': 'npm install',
      'gtime': 'brew install gnu-time'
    }

    return `if [ -z $(which ${dep}) ]; then echo "${dep} not installed. Please run ${map[dep]} then try again. Exiting ..." && exit 1; fi`
  }
};

config.default_commands = {
  get_pid: 'NODE_PID=$!',
  kill_node: 'kill -INT $NODE_PID',
  sleep: 'sleep 5',
  process_node_logs: `node --prof-process ./isolate-*`,
  testdir_cleanup: `rm -rf ./isolate-* ${config.default_dir}/*.txt`,
  path_import: 'source ~/.bashrc; source ~/.profile',
  check_dependencies: config.functions.checkDependency('$(npm bin)/loadtest')
};

config.clock = {
  program: `/usr/bin/time -v`
};

config.loadtest = {
  program: '"$(npm bin)/loadtest"',
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
