//環境參數
const env = process.env.NODE_ENV;
let HOST_CONF;
if(env === 'dev' || 'test') {
	HOST_CONF = 'http://localhost:9000/'
}

if(env === 'production') {
	HOST_CONF = 'http://lrs.im.ncue.edu.tw:9000/'
}

// if(env === 'production') {
// 	HOST_CONF = 'http://localhost:9000/'
// }

module.exports = {
	HOST_CONF
};
