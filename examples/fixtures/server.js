'use strict';

const http = require('http');

const server = http.createServer((req, res) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });

  req.on('end', () => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({results: ['an', 'array', 'of', 'results']}));
    return null;
  });
});

server.listen(3000);
