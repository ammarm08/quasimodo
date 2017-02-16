'use strict';

const quasimodo = require('../index.js');

quasimodo.configure({
  loadtest: {
    concurrency: 8,
    requests: 5000,
    postFile: '$TEST_FILE',
    type: 'application/json',
    target: 'http://localhost:3000/'
  }
});

quasimodo.registerTest({name: 'Server', path: './fixtures/server.js', flags: ['--turbo --max_inlined_source_size=700']});
quasimodo.registerTest({name: 'Server2', path: './fixtures/server2.js', flags: ['--turbo --max_inlined_source_size=700']});

quasimodo.before('TEST_FILE=/tmp/sample-text.json');
quasimodo.before('cat ./fixtures/sample-text.txt | jq -rM "{text: .}" > $TEST_FILE');

quasimodo.run();
