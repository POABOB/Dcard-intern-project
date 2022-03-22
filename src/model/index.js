const mysql = require('../db/mysql');
const xss = require('xss')

//查
const getURL = async (id) => {
	let sql = `select url, expireAt from url where id = ${xss(mysql.escape(id))} limit 1;`;
	//返回promise
	return mysql.exec(sql);

};

//增
const insertURL = async (url, expireAt) => {
	let sql = `INSERT INTO url (url, expireAt) VALUES (${xss(mysql.escape(url))},${xss(mysql.escape(expireAt))});`;
	return mysql.exec(sql).then(data => {
		return { id: data.insertId }
	});
};

module.exports = {
	getURL,
	insertURL,
};