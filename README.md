# Quasimodo

Automating some NodeJS profiling/load-testing so I have more time for shenanigans.

Load-testing uses `ab` on Linux and `loadtest` everywhere else.

## Sample Usage (TBD)

```js

// quasimodo-test.js

const quasimodo = require('quasimodo');

// register test(s) with identifying name, path_to_file, flags, and args
quasimodo.registerTest('TEST_ONE', './server.js', '--turbo --max_inlined_source_size=700');
quasimodo.registerTest('TEST_TWO', './bench.js', '--turbo --max_inlined_source_size=700');

// configure test output options
quasimodo.configure({
  loadtest: {
    post: '$TEST_FILE',
    type: 'application/json',
    concurrency: 8,
    requests: 500,
    target: 'http://localhost:8080/some_end_point'
  }
});

// run these commands once before all tests start
quasimodo.before('TEST_FILE=/tmp/big-text.json');
quasimodo.before('cat test/fixtures/big-text.txt | jq -rM "{text: .}" > $TEST_FILE');

// run these commands once after all tests complete
quasimodo.after('echo DONE');

// run these commands (comma separated) before each registered test
quasimodo.beforeEach('echo HI');

// run these commands (comma separated) after each registered test
quasimodo.afterEach('echo BYE');

// run all tests
quasimodo.run();
```

This should have generated a `quasimodo_tests/` folder with:
- profile-*.txt (profiling v8 CPU ticks)
- results.txt (time per test)
- quasimodo.sh (the shell script that runs all the tests you registered)
- TODO: graphs of CPU/memory usage

### Quasimodo##configure(options = {})

Available options:

- loadtest
- TBD

```
loadtest: '-c 8 -n 500 -p $TEST_FILE -T application/json http://localhost:3000/end_point'

.... OR ....

// These are currently the only params you can pass if you use an object
loadtest: {
  concurrency: INTEGER,
  requests: INTEGER,
  post: 'post data',
  put: 'put data',
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

```

### Methods

- `Quasimodo##registerTest(name, path_to_script, flags, args)`
- `Quasimodo##before('some cmd')`
- `Quasimodo##after('some cmd')`
- `Quasimodo##beforeEach('some cmd')`
- `Quasimodo##afterEach('some cmd')`
