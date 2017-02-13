'use strict';

const quasimodo = require('../index.js');

quasimodo.registerTest('Recursive', './fixtures/fibonacciR.js', '--turbo --max_inlined_source_size=700', '30');
quasimodo.run();
