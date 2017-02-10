# Quasimodo

Automating some NodeJS profiling/load-testing so I have more time for shenanigans.

Load-testing only works if your machine is compatible with apache-bench (`ab`)

## Dependencies

- ab
- stackvis
- TBD

## Sample Usage (TBD)

```js

// quasimodo-test.js

const quasimodo = require('quasimodo');

// register test(s) with identifying name, path_to_file and args_and_flags
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
quasimodo.before(['TEST_FILE=/tmp/big-text.json', 'cat test/fixtures/big-text.txt | jq -rM "{text: .}" > $TEST_FILE']);

// run these commands once after all tests complete
quasimodo.after(['echo DONE']);

// run these commands (comma separated) before each registered test
quasimodo.beforeEach(['echo HI']);

// run these commands (comma separated) after each registered test
quasimodo.afterEach(['echo BYE']);

// run all tests
quasimodo.run();
```

What the following test file will show as in the terminal:

```
$ node quasimodo-test

Tests registered: 2 ...

Running all tests ...

DONE
```

This should have generated a `quasimodo_tests/` folder with:
- profile-*.txt (profiling v8 CPU ticks and which functions consume these ticks)
- results.txt (time per test)
- quasimodo.sh (the shell script that runs all the tests you registered)
- TODO: graphs of CPU/memory usage

## Quasimodo##configure(options = {})

Available options:

#### loadtest (By default is disabled)
```
loadtest: '-c 8 -n 500 -p $TEST_FILE -T application/json http://localhost:3000/end_point'

.... OR ....

// These are the only params you can pass if you use an object
loadtest: {
  concurrency: 8,
  requests: 500,
  post: '$TEST_FILE',
  type: 'application/json',
  target: 'http://localhost:3000/endpoint'
}

```


## Quasimodo##registerTest(name, path_to_script, arguments_and_flags)

Register the NodeJS process to run as part of the test group


## Quasimodo##before(['COMMAND_ONE, 'COMMAND_TWO', 'COMMAND_THREE'])

An order-sensitive list of commands to run before running all the tests


## Quasimodo##after(['COMMAND_ONE, 'COMMAND_TWO', 'COMMAND_THREE'])

An order-sensitive list of commands to run after all tests finish running


## Quasimodo##beforeEach(['COMMAND_ONE, 'COMMAND_TWO', 'COMMAND_THREE'])

An order-sensitive list of commands to run before running each test


## Quasimodo##afterEach(['COMMAND_ONE, 'COMMAND_TWO', 'COMMAND_THREE'])

An order-sensitive list of commands to run after each test runs
