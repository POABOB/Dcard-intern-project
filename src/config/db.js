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
}

if(env === 'production') {
	MYSQL_CONF = {
			host: 'mysql',
			user: 'root',
			password: 'root',
			port: '3306',
			database: 'shortURL'
		};
	REDIS_CONF = {
		port: 6379,
		host: 'redis'
	};
}

module.exports = {
	MYSQL_CONF,
	REDIS_CONF
};
