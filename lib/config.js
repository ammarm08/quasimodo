'use strict';

const config = exports = module.exports = {
  default_dir: './quasimodo_tests',
  default_sh: 'quasimodo.sh',
  default_output: 'results.txt',
  default_profiling: 'profile-*.txt'
};

config.default_commands = {
  kill_node: 'pgrep -n node | xargs kill',
  process_node_logs: `node --prof-process ./isolate-*`,
  clean_up: `rm ./isolate-* ${config.default_dir}/${config.default_output} ${config.default_dir}/${config.default_profiling}`,
};

config.loadtest = {
  program: 'ab',
  available_opts: [
    'concurrency', 'requests', 'post', 'put', 'type', 'target',
    'gnuplot', 'protocol', 'headers', 'keepalive', 'timelimit', 'auth'
  ],
  bindings: {
    'concurrency': '-c',
    'requests': '-n',
    'post': '-p',
    'put': '-u',
    'type': '-T',
    'gnuplot': '-g',
    'protocol': '-f',
    'headers': '-H',
    'keepalive': '-k',
    'timelimit': '-t',
    'auth': '-A'
  }
};
