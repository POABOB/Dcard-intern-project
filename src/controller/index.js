const { get, set } = require('../db/redis');
const { ErrorModel, BaseModel } = require('../utils/response');
const { HOST_CONF } = require('../config/url');
const { getURL, insertURL, getRandomURL, insertRandomURL} = require('../model/index');
const { validateUrl, validateExpire, convertIdToShortId, convertShortIdToId } = require("../utils/url");
const { datetimeRegex } = require("../utils/const");

const getOriginUrlById = async (req, res, ShortId) => {
    try {
        //先將64進位的id轉化10進位id
        const id = convertShortIdToId(ShortId);
        let result = await get(id);
        
        if(result === null) {
            // redis沒有，往mysql找
            result = await getURL(id)
            // result = await getRandomURL(id)
            
            // 有沒有找到都要存入redis，目的是避免同時大量查找不存在的url

            if(result.length !== 0) {
                result = result[0]
                set(id, { url: result['url'], expireAt: result['expireAt'] })
            } else {
                set(id, { url: null, expireAt: Date.now() / 1000 })
            }
        }
        //redis有，直接從redis返回
        if(result['url'] !== undefined && validateExpire(result['expireAt'])) {
            //如果這筆短網址存在，使用302避免301 expire了照樣會有cache
            res.writeHead(302, { 'Location': result['url'] });
        } else {
            res.writeHead(404, {"Content-type": "text/plain"});
            res.write(`${req.method} ${req.path} 404 Not Found\n`);
        }
        res.end();
        return;
    } catch(e) {
        res.writeHead(500, {"Content-type": "text/plain"});
        return new ErrorModel(`${e.stack}`);
    }
};

const insertOriginUrl = async (req, res) => {
    try {
        let url = req.body.url;
        let expireAt = req.body.expireAt;
        if(url === "" || !validateUrl(url)) {
            res.writeHead(400, {"Content-type": "text/plain"});
            return new ErrorModel(`The post data url = ${url} is invalid!!!`);
        } else if(expireAt.match(datetimeRegex) === null || Date.parse(expireAt) < Date.now() / 1000) {
            res.writeHead(400, {"Content-type": "text/plain"});
            return new ErrorModel(`The post data expireAt = ${expireAt} is invalid!!!`);
        }

        expireAt = Math.floor(new Date(expireAt).getTime() / 1000);

        const Start = Date.now()
        const data = await insertURL(url, expireAt);
        const End = Date.now()
		console.log(`Start at ${Start}, End at ${End}/, Random Total time: ${(End - Start) / 1000} seconds`)

        // const data = await insertRandomURL(url, expireAt);

        // 插入redis
        set(data['id'], { url: url, expireAt: expireAt })
        // 得到新增的id後
        const ShortId = convertIdToShortId(data['id'])
        // 返回BaseModel
        return new BaseModel(ShortId, HOST_CONF + ShortId);
    } catch(e) {
        res.writeHead(500, {"Content-type": "text/plain"});
        return new ErrorModel(`${e.stack}`);
    }
};

module.exports = {
    getOriginUrlById,
    insertOriginUrl
}