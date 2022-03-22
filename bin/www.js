const http = require('http');

const PORT = 9000;
const serverHandler = require('../app');

const server = http.createServer(serverHandler);

server.listen(PORT);
console.log(`Listening on port ${PORT}...Press CTRL-C to stop.`);