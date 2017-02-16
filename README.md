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
quasimodo.registerTest({

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
// -- Currently supported options from https://github.com/alexfernandez/loadtest --
  loadtest: {

    // requests

    concurrency: INTEGER, // required: # of concurrent clients to hit URL
    requests: INTEGER, // required: # of requests to make
    requests_per_second: INTEGER, // optional: requests per second sent to server
    target: 'String', // required: URL to hit

    // transport

    protocol: 'String', // optional: ssl2/tls1/etc
    insecure: BOOLEAN, // optional: allow invalid and self-signed certificates over https
    cert: 'String', // optional: path_to_cert_file. requires `key`
    key: 'String', // optional: path_to_key. requires `cert`
    timelimit: INTEGER, // optional: max # of secs to send requests
    timeout: INTEGER, // optional: max # of ms to wait on each request
    keepalive: BOOLEAN, // optional: (Connection: Keep-Alive)

    // data

    method: 'String', // optional: GET/POST/PUT/etc
    type: 'String', // optional: content-type
    data: 'String', // optional: raw data to send over the wire. require `type` and `method`

    postFile: 'String', // optional: path_of_file to post. requires `type`
    putFile: 'String', // optional: path_of_file to put. requires `type`
    patchFile: 'String', // optional: path_of_file to patch. requires `type`
    postBody: 'String', // optional: raw data to post. requires `type`
    patchBody: 'String', // optional: raw data to patch. requires `type`

    // headers

    headers: { // optional: headers to pass on each request
      'header-key': 'header-value',
      'another-header': 'another-value',
      ...
    },
    cookies: { // optional: cookies to pass on each request
      'cookie-key': 'cookie-value',
      'another-cookie': 'another-value',
      ...
    }
  }
});

```

## Dependencies

If you're on a Mac, run `brew install gnu-time` to install `gtime`, which allows for verbose output when timing how long a process takes to run.

All other dependencies ship with Quasimodo, requiring a simple `npm install` to get set up.

In the future, I may expose the configurations so you can tweak these as you wish.

## TO-DO

- Generate visualizations on heap usage and CPU usage over time
- TBD
