const { MYSQL_CONF } = require('../config/db');
const mysql = require('mysql');
let conn;

function connect() {
	conn = mysql.createConnection(MYSQL_CONF);
	conn.connect(handleError);
	conn.on('error', handleError);
}

function exec(sql) {
	const promise = new Promise((resolve, reject) => {
		conn.query(sql, (err, result) => {
			if(err) {
				reject(err);
				return;
			}
			resolve(result);
		});
	});

	return promise;
}

function handleError(err) {
	if (err) {
	  	// 如果是連線斷開，自動重新連線
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			connect();
		} else {
			console.error(err.stack || err);
		}
	}
}

connect()

module.exports = {
	exec,
	escape: mysql.escape
}