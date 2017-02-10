'use strict';

const quasimodo = require('../index.js');

quasimodo.registerTest('Recursive', './fibonacciR.js', '--turbo --max_inlined_source_size=700', '40');
quasimodo.registerTest('Dynamic', './fibonacciDP.js', '--turbo --max_inlined_source_size=700', '40');

quasimodo.run();
