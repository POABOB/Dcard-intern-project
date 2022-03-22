const redis = require('redis');
const { REDIS_CONF } = require('../config/db');

// 生成redis的client
const client = redis.createClient(REDIS_CONF.port, REDIS_CONF.host);

module.exports = {
	// 存储值
	set: set = (key, val) => {
		if(typeof val === 'object') {
			val = JSON.stringify(val);
		}
		client.set(key, val)
	},
 
	// 获取string
	get: get = (key) => {
		return new Promise((resolve, reject) => {
			client.get(key, (err, val) => {
				if (err) {
					reject(err);
				}else{
					if(val === null) {
							resolve(null);
							return;
					}
					try {
						resolve(JSON.parse(val));
					} catch (err) {
						reject(err);
					}
				}
			});
		});
	}
}