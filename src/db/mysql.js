const mysql = require('mysql');
const { MYSQL_CONF } = require('../config/db');

module.exports = {
	config: MYSQL_CONF,
	pool: null,
	create: function () {
		if(!this.pool) {
			this.pool = mysql.createPool(this.config)
		}
	},
	exec: async function (sql)  {
		return new Promise(( resolve, reject ) => {
			try {
				this.create();
				this.pool.getConnection(function(err, connection) {
					if (err) {
						reject(err);
					} else {
						connection.query(sql, (err, result) => {

							if (err) {
								reject(err);
									console.error(err);
							} else {
								resolve(result);
								
							}
							connection.release();
						});
					}
				});
			} catch (e) {
				reject(e);
				console.error(e);
			}
		});
	},
	escape: mysql.escape
}