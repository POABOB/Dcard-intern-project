const redis = require('redis');
const { REDIS_CONF } = require('../config/db');

module.exports = {
	config: REDIS_CONF,
	client: null,
	create: function () {
		if(!this.client) {
			this.client = redis.createClient(this.config.port, this.config.host);
			this.client.connect();
			this.client.on('error', err => {console.log('Error ' + err);});
		}
	},
	set: async function (key, val) {
		this.create();
		if(typeof val === 'object') {
			val = JSON.stringify(val);
		}

		this.client.set(key, val);
	},
	get: async function (key) {
		return new Promise((resolve, reject) => {
				this.create();

				this.client.get(key, (err, val) => {
				if(err) {
					reject(err);
					return;
				}
	
				if(val === null) {
					resolve(null);
					return;
				}
				try {
					resolve(JSON.parse(val));
				} catch (err) {
					reject(err);
				}
			});
		});
	}
}