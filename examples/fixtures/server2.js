'use strict';

const http = require('http');
const func = function () {};

const server = http.createServer((req, res) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });

  req.on('end', () => {
    req.body = data ? JSON.parse(data) : {};
    res.writeHead(200, {'Content-Type': 'application/json'});

    for (let i = 0; i < 10000; i++) {
      func();
    }
    res.end(JSON.stringify(req.body));
    return null;
  });
});

server.listen(3000);
