//環境參數
const env = process.env.NODE_ENV;
let HOST_CONF;
if(env === 'dev') {
	HOST_CONF = 'http://localhost/'
}

if(env === 'production') {
	HOST_CONF = 'http://lrs.im.ncue.edu.tw/'
}

module.exports = {
	HOST_CONF
};
