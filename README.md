# Quasimodo

Automating some NodeJS profiling/load-testing so I have more time for water cooler talk ...

## Dependencies

- loadtest
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
quasimodo.configureTest({
  loadtest: {
    post: '$TEST_FILE',
    type: 'application/json',
    concurrency: 8, 
    requests: 500, 
    target: 'http://localhost:8080/some_end_point'
  },
  prof_dump: false, // default: true,
  stackvis:  true, // default: true,
  result_path: './results.txt', // default: './results.txt'
});

// run these commands once before all tests start
quasimodo.before(['TEST_FILE=/tmp/big-text.json', 'cat test/fixtures/big-text.txt | jq -rM "{text: .}" > $TEST_FILE']);

// run these commands once after all tests complete
quasimodo.after(['echo DONE']);

// run these commands (comma separated) before each registered test
quasimodo.beforeEach(['echo RUNNING $TEST_NAME']);

// run these commands (comma separated) after each registered test
quasimodo.afterEach(['echo FINISHING $TEST_NAME']);

// run all tests
quasimodo.run();
```

What the following test file will show as in the terminal:

```
$ node quasimodo-test

Tests registered: 2 ... 
Enabled configurations: loadtest, stackvis
Running all tests ...

Running pre-test tasks ...

RUNNING TEST_ONE
<some output generated by target scripts>
FINISHING TEST_ONE
 
RUNNING TEST_TWO
<some output generated by target script>
FINISHING TEST_TWO

DONE 
```

This should have generated:

- Plaintext `results.txt` with test stats
- Graph of CPU usage per test
- Graph of Memory usage per test
- Stackvis SVG of CPU usage for each function call (v8)
