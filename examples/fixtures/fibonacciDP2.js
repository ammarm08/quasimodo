'use strict';

const fibonacci = n => {
  let prev = 0;
  let current = 1;
  let temp = 0;

  for (let i = 2; i <= n; i++) {
    temp = current + prev;
    prev = current;
    current = temp;
  }

  return current;
}

const n = process.argv.slice(2)[0] || 10;
fibonacci(n);
