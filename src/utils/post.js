// 獲取post過來的data
module.exports = {
	getPostData: (req, res) => {
		return new Promise((resolve, reject) => {
			//如果方法不是POST，返回空
			if(req.method === 'GET' || req.method === 'DELETE') {
				resolve({});
				return;
			}
			//如果header不是json，返回空
			if(req.headers['content-type'] !== 'application/json') {
				resolve({});
				return;
			}

			let postData = '';
			req.on('data', chunk =>{
				postData += chunk.toString();
			});

			//如果沒有POST資料，返回空
			req.on('end', () => {
				if(!postData) {
					resolve({});
					return;
				}

				resolve(JSON.parse(postData));
			});
		});
	}
}