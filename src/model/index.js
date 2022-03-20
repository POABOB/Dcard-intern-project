const { exec, escape } = require('../db/mysql');
const xss = require('xss')

//查
const getURL = async (id) => {
	let sql = `select url, expireAt from url where id = ${xss(escape(id))} limit 1;`;
	//返回promise
	return await exec(sql);
};

//增
const insertURL = async (url, expireAt) => {
	let sql = `INSERT INTO url (url, expireAt) VALUES (${xss(escape(url))},${xss(escape(expireAt))});`;
	return await exec(sql).then(data => {
		return { id: data.insertId }
	});
};

module.exports = {
	getURL,
	insertURL,
};