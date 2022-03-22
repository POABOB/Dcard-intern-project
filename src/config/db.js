//環境參數
const env = process.env.NODE_ENV;

let MYSQL_CONF;
let REDIS_CONF;

if(env === 'dev') {
	//mysql
	MYSQL_CONF = {
		host: 'localhost',
		user: 'root',
		password: 'root',
		port: '3306',
		database: 'shortURL',
		waitForConnections : true,
		connectionLimit : 10,
		acquireTimeout: 10000
	};
	//redis
	REDIS_CONF = {
		port: 6379,
		host: 'localhost'
	};
}

if(env === 'production') {
	//mysql
	MYSQL_CONF = {
		host: 'localhost',
		user: 'root',
		password: 'root',
		port: '3306',
		database: 'shortURL',
		waitForConnections : true,
		connectionLimit : 10,
		acquireTimeout: 10000
	};
	//redis
	REDIS_CONF = {
		port: 6379,
		host: 'localhost'
	};
}

module.exports = {
	MYSQL_CONF,
	REDIS_CONF
};
