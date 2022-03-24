const { getPostData } = require('./src/utils/post');
const handleIndexRouter = require('./src/router/index');

const serverHandler = (req, res) => {
	//設定返回格式為JSON
	res.setHeader('Content-type', 'application/json');

	//獲取path
	const url = req.url;
	req.path = url.split('?')[0];

    getPostData(req, res).then(postData => {
		req.body = postData;
		
		//Router註冊
		//處理index路由
		const index =  handleIndexRouter(req, res);
		if(index) {
			index.then(data => res.end(JSON.stringify(data)))
			return;
		}
		
		//404
		res.writeHead(404, {"Content-type": "text/plain"});
		res.write(`${req.method} ${req.path} 404 Not Found\n`);
		res.end();
	});
};

module.exports = serverHandler;