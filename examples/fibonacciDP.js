'use strict';

const fibonacci = n => {
  const cache = [0, 1];

  for (let i = 2; i <= n; i++) {
    cache.push(cache[i - 1] + cache[i - 2]);
  }

  return cache[n];
}

const n = process.argv.slice(2)[0] || 10;
fibonacci(n);
