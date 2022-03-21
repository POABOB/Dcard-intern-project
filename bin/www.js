const http = require('http');

const PORT = 80;
const serverHandler = require('../app');

const { connectRedis } = require('../src/db/redis');
const { connectMysql, handleError } = require('../src/db/mysql');
const { MYSQL_CONF, REDIS_CONF } = require('../src/config/db');

// 初始化redis
try {
    connectRedis({ port: REDIS_CONF.port, host: REDIS_CONF.host });
} catch (e) {
    console.error("Redis connetion/init error:" + e.stack);
    process.exit(1);
}

// 初始化mysql
try {
    connectMysql(MYSQL_CONF);
} catch (e) {
    console.error("Mysql connetion/init error:" + e.stack);
    process.exit(1);
}

const server = http.createServer(serverHandler);

server.listen(PORT);
console.log(`Listening on port ${PORT}...Press CTRL-C to stop.`);