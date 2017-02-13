'use strict';

const fibonacci = n => {
  if (n < 1) return 0;
  if (n === 1) return 1;
  if (n === 2) return 1;

  return fibonacci(n - 1) + fibonacci(n - 2);
}

const n = process.argv.slice(2)[0] || 10;

fibonacci(n);
