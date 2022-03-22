const { get, set } = require('../db/redis');
const { ErrorModel, BaseModel } = require('../utils/response');
const { HOST_CONF } = require('../config/url');
const { getURL, insertURL} = require('../model/index');
const { validateUrl, validateExpire, convertIdToShortId, convertShortIdToId } = require("../utils/url");
const { datetimeRegex } = require("../utils/const");

const getOriginUrlById = async (ShortId, req, res) => {
    try {
        //先將64進位的id轉化10進位id
        const id = convertShortIdToId(ShortId);
        let result;
        result = await get(id)
        if(result === null) {
            // redis沒有，往mysql找
            result = await getURL(id)
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
        res.writeHead(400, {"Content-type": "text/plain"});
        return new ErrorModel(`Error Ocurred`);
    }
};

const insertOriginUrl = async (url, expireAt) => {
    try {
        if(url === "" || !validateUrl(url)) {
            res.writeHead(400, {"Content-type": "text/plain"});
            return new ErrorModel(`The post data url = ${url} is invalid!!!`);
        } else if(expireAt.match(datetimeRegex) === null || Date.parse(expireAt) < Date.now().getTime() / 1000) {
            res.writeHead(400, {"Content-type": "text/plain"});
            return new ErrorModel(`The post data expireAt = ${expireAt} is invalid!!!`);
        }

        expireAt = new Date(expireAt).getTime() / 1000;
        const data = await insertURL(url, expireAt)

        // 插入redis
        set(data['id'], { url: url, expireAt: expireAt })
        // 得到新增的id後
        const ShortId = convertIdToShortId(data['id'])
        // 返回BaseModel
        return new BaseModel(ShortId, HOST_CONF + ShortId);
    } catch(e) {
        res.writeHead(400, {"Content-type": "text/plain"});
        return new ErrorModel(`Error Ocurred`);
    }
};

module.exports = {
    getOriginUrlById,
    insertOriginUrl
}