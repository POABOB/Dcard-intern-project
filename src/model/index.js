const mysql = require('../db/mysql');
const xss = require('xss')
const { get, set, quit } = require('../db/redis');
const { validateExpire } = require("../utils/url");

const env = process.env.NODE_ENV;
const tableName = `url${(env === 'test') ? '_test' : ''}`;
const tableNameRandom = `url_random${(env === 'test') ? '_test' : ''}`;

//查
const getURL = async (id) => {
	let sql = `select url, expireAt from ${tableName} where id = ${xss(mysql.escape(id))} limit 1;`;
	//返回promise
	return mysql.exec(sql);

};

//增
const insertURL = async (url, expireAt) => {
	let sql = `INSERT INTO ${tableName} (url, expireAt) VALUES (${xss(mysql.escape(url))},${xss(mysql.escape(expireAt))});`;
	return mysql.exec(sql).then(data => {
		return { id: data.insertId }
	});
};

//Random查
const getRandomURL = async (id) => {
	let sql = `select url, expireAt from ${tableNameRandom} where id = ${xss(mysql.escape(id))} limit 1;`;
	//返回promise
	return mysql.exec(sql);
};

//Random增
const insertRandomURL = async (url, expireAt) => {
	try {
		const Start = Date.now()
		//先判斷Redis有多少rows和是不是最近幾分鐘更新的
		let result = await get('url_random_nums');
	
		//如果Redis沒有
		if(result === null) {
			//查詢Mysql，返回時並插入Redis
			let sql = `SELECT urlNums FROM url_random_nums WHERE id=1 LIMIT 1;`;   
			result = await mysql.exec(sql);
			result = result[0]['urlNums'];
			result = { urlNums: result, expireAt: Math.floor(Date.now() / 1000) + 12 * 60 * 60 }
			set('url_random_nums', result)
		}
	
		const idInsertMin = parseInt(result['urlNums'] / 10000)  * 10000 + 1
		const idInsertMax = (parseInt(result['urlNums'] / 10000) + 1) * 10000
	
		const id = parseInt(Math.random() * idInsertMax);

		const sql1 = `SELECT id FROM url_random WHERE id >=${id} AND id <=${idInsertMax} AND url='0' LIMIT 1;`;
		const sql2 = `SELECT id FROM url_random WHERE id >=${idInsertMin} AND id <=${id} AND url='0' LIMIT 1;`;
		let sqlReturn;
		
		sqlReturn = await mysql.exec(sql1);
		if(sqlReturn.length === 0) {
			sqlReturn = await mysql.exec(sql2);
			if(sqlReturn.length === 0) {
				console.log(`ERROR CAN'T GET id`)
				return [];
			}
		}
	
		const returnId = sqlReturn[0]['id']
		sql = `UPDATE url_random SET url='${url}', expireAt=${expireAt} WHERE id = ${returnId};`
		sqlReturn = await mysql.exec(sql);

		if(sqlReturn['affectedRows'] === 0) {
			console.log(`ERROR CAN'T UPDATE`)
			return [];
		}
		
		set('url_random_nums', { urlNums: result['urlNums'] + 1, expireAt: Math.floor(Date.now() / 1000) + 12 * 60 * 60 })
		const End = Date.now()
		console.log(`Start at ${Start}, End at ${End}/, Random Total time: ${(End - Start) / 1000} seconds`)
		return {id: returnId};
	} catch(e) {
        console.log(`${e.stack}`);
    }

};

//開啟服務或cronjob時，COUNT資料
const selectCountForeach = async () => { 
    try {
        const Start = Date.now()
        let count = 0;
        //先判斷Redis有多少rows和是不是最近幾分鐘更新的
        let result = await get('url_random_nums');

        //如果get沒有或超過12小時沒更新
        if(result === null || !validateExpire(result['expireAt'])) {
            console.log(`result is null or reslut is expired!!!`);
            // redis沒有，往mysql找
            let sql = `SELECT urlNums FROM url_random_nums WHERE id=1 LIMIT 1;`;   
            result = await mysql.exec(sql);
            result = result[0]['urlNums'];

            let idCountMin = parseInt(result / 1000000)  * 1000000 + 1
            let idCountMax = (parseInt(result / 1000000) + 1) * 1000000

            while(true) {
                //找尋範圍內
                sql = `SELECT COUNT(id) as id FROM url_random WHERE id >= ${idCountMin} AND id <= ${idCountMax} AND url != '0';`;   
                const nums = await mysql.exec(sql);
                nums['id'] = nums[0]['id'];
                
                count += nums['id'];
                // 如果滿了 繼續往下100萬筆計算
                if(nums['id'] < 1000000) {
                    break;
                }
                
                console.log('loop', count, nums);
                idCountMin += 1000000;
                idCountMax += 1000000;
            }

            ///更新url_random_nums
            sql = `UPDATE url_random_nums SET urlNums=${count} WHERE id = 1;`;   
            mysql.exec(sql);

            //更新Redis urlNums，設定12小時候過期
            result = { urlNums: count, expireAt: Math.floor(Date.now() / 1000) + 12 * 60 * 60 }
            set('url_random_nums', result)
            
            //關閉連線
            mysql.end();
        }

        const End = Date.now()
        console.log(result)
        console.log(`Start at ${Start}, End at ${End}/, Normal Total time: ${(End - Start) / 1000} seconds`)
        //關閉連線
        quit();
		return;
    } catch(e) {
        console.log(`${e.stack}`);
    }
	console.log(3);
}



module.exports = {
	getURL,
	insertURL,
	selectCountForeach,
	getRandomURL,
	insertRandomURL
};