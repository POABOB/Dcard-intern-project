const mysql = require('mysql');
const { MYSQL_CONF } = require('../config/db');

//不使用箭頭函數原因是因為不能使用this
module.exports = {
	config: MYSQL_CONF,
	pool: null,
	create: function () {
		if(!this.pool) {
			this.pool = mysql.createPool(this.config)
		}
	},
	exec: async function (sql, values)  {
		return new Promise(( resolve, reject ) => {
			try {
				this.create();
				this.pool.getConnection(function(err, connection) {
					if (err) {
						reject(err);
					} else {
						connection.query(sql, values, (err, result) => {

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
	end: function() {
        this.pool.end((err) => {
            if (err) throw err;
			process.exit();
        });
	},
	escape: mysql.escape
}