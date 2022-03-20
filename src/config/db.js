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
		};
	//redis
	REDIS_CONF = {
		port: 6379,
		host: '127.0.0.1'
	};
	LOG_CONF = true
}

if(env === 'production') {
	MYSQL_CONF = {
			host: 'localhost',
			user: 'root',
			password: 'root',
			port: '3306',
			database: 'shortURL'
		};
	REDIS_CONF = {
		port: 6379,
		host: '127.0.0.1'
	};

	LOG_CONF = false
}

module.exports = {
	MYSQL_CONF,
	REDIS_CONF,
	LOG_CONF
};
