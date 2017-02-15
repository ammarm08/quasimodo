'use strict';

const quasimodo = require('../index.js');

quasimodo.configure({
  loadtest: {
    concurrency: 8,
    requests: 5000,
    target: 'http://localhost:3000/'
  }
});

quasimodo.registerTest({name: 'Server', path: './fixtures/server.js', flags: ['--turbo --max_inlined_source_size=700']});

quasimodo.run();
