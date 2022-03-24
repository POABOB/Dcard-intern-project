const redis = require('redis');
const { REDIS_CONF } = require('../config/db');

// 生成redis的client
const client = redis.createClient(REDIS_CONF.port, REDIS_CONF.host);
// client.connect();
// client.on('error', err => {
// 	console.log(err);
// });
module.exports = {
	// 存储值
	set: async (key, val) => {
		return new Promise((resolve, reject) => {
			if(typeof val === 'object') {
				val = JSON.stringify(val);
			}
	
			client.set(key, val, (err, res) => {
				if(err) {
					reject(err);
					return;
				}
	
				try {
					resolve(JSON.parse(res));
				} catch(ex) {
					resolve(res);
				}
			});
		});
	},
 
	// 获取string
	get: async (key) => {
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