'use strict';

const quasimodo = require('../index.js');

quasimodo.configure({
  loadtest: {
    concurrency: 8,
    requests: 500,
    target: 'http://localhost:3000/'
  },

  output: './sample.txt'
});

quasimodo.registerTest('Server', './server.js', '--turbo');
quasimodo.run();
