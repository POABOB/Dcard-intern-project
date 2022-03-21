const { match } = require('path-to-regexp');
const { getOriginUrlById, insertOriginUrl } = require("../controller/index");

const handleIndexRouter = (req, res) => {
    // 獲取方法和動態url_id的key
	const method = req.method;

	//GET，獲取短url
    const fn = match("/:ShortId([a-zA-Z0-9\-~]{5})", { decode: decodeURIComponent })(req.path);
	if(method === 'GET' && fn) {
        return getOriginUrlById(fn.params.ShortId, req, res)
	}

    //POST，新增短URL
	if(method === 'POST' && req.path === '/api/v1/urls') {
		return insertOriginUrl(req.body.url, req.body.expireAt);
	}
};

module.exports = handleIndexRouter;
