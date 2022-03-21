const mysql = require('mysql');
const { promisify } = require('util');
let conn, query;

const connectMysql = async (config) => {
	return new Promise((resolve, reject) => {
		try {
			conn = mysql.createConnection(config);
			query = promisify(conn.query).bind(conn);
			conn.on('error', handleError);
			resolve(conn);
		} catch (err) {
			reject(err);
		}
	});
}

const exec = async (sql) => {
	return query(sql);
}

const handleError = (err) => {
	if (err) {
	  	// 如果是連線斷開，自動重新連線
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			connectMysql();
		} else {
			console.error(err.stack || err);
		}
	}
}

module.exports = {
	connectMysql, 
	exec,
	escape: mysql.escape
}