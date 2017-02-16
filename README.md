# Quasimodo

A NodeJS performance profiler and load-tester.

## Possible Use Cases

- Which fibonacci algorithm runs fastest? (see `/examples/fibonacci-bench`)
- Which server implementation handles requests fastest? (see `examples/server-bench`)
- For each of the above, which code paths are bottlenecking performance?

## Sample Usage

```js

// testing two different fibonacci algorithms for n = 40

const quasimodo = require('quasimodo');

quasimodo.registerTest({
  name: 'TEST_ONE',
  path: './fibonacci-recursive.js',
  flags: ['--some', '--fancy', '-v8-flags'], // optional
  args: ['40'], // optional
  env: ['NODE_ENV=test', 'NODE_FOO=bar'], // optional
  binary: '/path/to/custom/node/binary' // optional
});

quasimodo.registerTest({
  name: 'TEST_TWO',
  path: './fibonacci-dynamic.js',
  flags: ['--some', '--fancy', '-v8-flags'], // optional
  args: ['40'], // optional
  env: ['NODE_ENV=test', 'NODE_FOO=bar'], // optional
  binary: '/path/to/custom/node/binary' // optional
});

// HOOKS

quasimodo.beforeEach('echo Running next variant ...');
quasimodo.afterEach('echo Finishing variant ...');

quasimodo.after('echo Done with all tests');

quasimodo.run();
```

This should have generated a `quasimodo_tests/` folder with:
- `profile-*.txt` (profiling v8 CPU ticks)
- `results.txt` (time/memory per test)
- `quasimodo.sh` (the shell script that runs all the tests you registered)
- TODO: graphs of CPU/memory usage

### Methods

- `Quasimodo##configure(options=Object)`
- `Quasimodo##registerTest(options=Object)`
- `Quasimodo##before(command=String)`
- `Quasimodo##after(command=String)`
- `Quasimodo##beforeEach(command=String)`
- `Quasimodo##afterEach(command=String)`
- `Quasimodo##run()`

### Available Test Registration options

```js
quasimodo.configure({

  name: 'STRING', // required: test_name
  path: 'STRING', // required: path_to_script
  binary: 'STRING', // optional: path_to_binary (default: process.execPath) 
  flags: ['--array', '--of', 'flags'], // optional: flags to pass to NodeJS (default: none)
  args: ['array', 'of', 'args'], // optional: args to pass to NodeJS (default: none)
  env: ['array', 'of', 'environment', 'variables'] // optional: env variables to pass to NodeJS (default: none)
  
});
```

### Available Configuration Options

If you're testing server code or long-running processes, you can also pass `loadtest` options into `Quasimodo##configure`.

You can either manually pass in the string with all args/flags ...
```js
quasimodo.configure({
  loadtest: '-c 8 -n 500 -p $TEST_FILE -T application/json http://localhost:3000/end_point'
});
```

... or you can specify loadtest params as options
```js
quasimodo.configure({
// -- Currently supported options --
  loadtest: {
    concurrency: INTEGER,
    requests: INTEGER,
    post: 'filename',
    put: 'filename',
    type: 'Content-Type',
    target: 'url',
    gnuplot: 'output_filename',
    protocol: 'ssl2/tls1/etc',
    headers: {
      'header-key': 'header-value',
      'another-header': 'another-value',
      ...
    },
    keepalive: BOOLEAN,
    timelimit: INTEGER,
    auth: 'username:password'
  }
});

```

## Dependencies

- Linux: `ab` (run `apt-get install apache2-utils`)
- Mac/BSDs: `gtime` (run `brew install gnu-time`), `loadtest` (ships as dev dependency with Quasimodo)
- Everyone else: `loadtest` (ships as dev dependency with Quasimodo)

In the future, I may expose the configurations so you can tweak these as you wish.

## TO-DO

- Generate visualizations on heap usage and CPU usage over time
- Pass in flags and arguments in array (or pass in all test registration opts in object)
- TBD
