const http = require('http');

const PORT = 80;
const serverHandler = require('../app');

const server = http.createServer(serverHandler);

server.listen(PORT);
console.log(`Listening on port ${PORT}`);