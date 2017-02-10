'use strict';

const quasimodo = require('../index.js');

quasimodo.configure({
  loadtest: {
    concurrency: 8,
    requests: 5000,
    target: 'http://localhost:3000/'
  }
});

quasimodo.registerTest('Server', './server.js', '--turbo --max_inlined_source_size=700');
quasimodo.run();
