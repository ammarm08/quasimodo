# Quasimodo

Automating some NodeJS profiling/load-testing so I have more time for shenanigans.

## Dependencies

- Linux: `ab` (run `apt-get install apache2-utils`)
- Mac/BSDs: `gtime` (run `brew install gnu-time`), `loadtest` (ships as dev dependency with Quasimodo)
- Everyone else: `loadtest` (ships as dev dependency with Quasimodo)

In the future, I may expose the configurations so you can tweak these as you wish.

## Sample Usage

```js

// quasimodo-test.js

const quasimodo = require('quasimodo');

quasimodo.registerTest('TEST_ONE', './server.js', '--some-fancy-v8-flag --turbo', 'some_args');
quasimodo.registerTest('TEST_TWO', './bench.js', '--some-other-fancy-v8-flags', 'some_other_args');

quasimodo.configure({
  loadtest: {
    post: '$TEST_FILE',
    type: 'application/json',
    concurrency: 8,
    requests: 500,
    target: 'http://localhost:8080/some_end_point'
  }
});

// HOOKS

quasimodo.before('TEST_FILE=/tmp/big-text.json');
quasimodo.before('cat test/fixtures/big-text.txt | jq -rM "{text: .}" > $TEST_FILE');

quasimodo.after('echo DONE');

quasimodo.beforeEach('echo HI');
quasimodo.afterEach('echo BYE');

quasimodo.run();
```

This should have generated a `quasimodo_tests/` folder with:
- `profile-*.txt` (profiling v8 CPU ticks)
- `results.txt` (time/memory per test)
- `quasimodo.sh` (the shell script that runs all the tests you registered)
- TODO: graphs of CPU/memory usage

### Available Options

- loadtest
- TBD

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
});

```

### Methods

- `Quasimodo##configure(options=Object || args/flags=String)`
- `Quasimodo##registerTest(name=String, path_to_script=String, flags=String, args=String)`
- `Quasimodo##before(command=String)`
- `Quasimodo##after(command=String)`
- `Quasimodo##beforeEach(command=String)`
- `Quasimodo##afterEach(command=String)`
