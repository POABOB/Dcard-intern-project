const { getOriginUrlById, insertOriginUrl } = require("../controller/index");

const handleIndexRouter = (req, res) => {
    // 獲取方法和動態url_id的key
	const method = req.method;

    //GET，獲取短url
    //只能ShortId匹配 大小寫字母 數字 - ~
    // ex. /ABCE~ or /AB-DE/
    const ShortId = req.path.match(/^\/([A-Za-z0-9\-~]{5})\/?$/)
	if(method === 'GET' && ShortId !== null) {
        return getOriginUrlById(ShortId[1], req, res)
	}

    //POST，新增短URL
	if(method === 'POST' && req.path === '/api/v1/urls') {
		return insertOriginUrl(req.body.url, req.body.expireAt);
	}
};

module.exports = handleIndexRouter;
