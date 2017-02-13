'use strict';

const quasimodo = require('../index.js');

quasimodo.registerTest('Recursive', './fixtures/fibonacciR.js', '--turbo --max_inlined_source_size=700', '40');
quasimodo.registerTest('Dynamic', './fixtures/fibonacciDP.js', '--turbo --max_inlined_source_size=700', '40');
quasimodo.registerTest('Dynamic2', './fixtures/fibonacciDP2.js', '--turbo --max_inlined_source_size=700', '40');

quasimodo.run();
