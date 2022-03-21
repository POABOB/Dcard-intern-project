const redis = require('redis');
const { promisify } = require('util');
let client, setAsync, getAsync;

const connectRedis = async (config) => {
	return new Promise((resolve, reject) => {
		try {
			client = redis.createClient(config.port, config.host);
			setAsync = promisify(client.set).bind(client);
			getAsync = promisify(client.get).bind(client);
			resolve(client);
		} catch (err) {
			reject(err);
		}
	});
}


const set = async (key, val) => {
	if(typeof val === 'object') {
		val = JSON.stringify(val);
	}
  	return setAsync(key, val);
}

const get = async (key) => {
	return getAsync(key);
}

module.exports = {
	set,
	get,
	connectRedis
}

