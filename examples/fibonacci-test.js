'use strict';

const quasimodo = require('../index.js');

quasimodo.registerTest({name: 'Recursive', path: './fixtures/fibonacciR.js', flags: ['--turbo --max_inlined_source_size=700'], args: ['40']});

quasimodo.run();
