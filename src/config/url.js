//環境參數
const env = process.env.NODE_ENV;
let HOST_CONF;
if(env === 'dev') {
	HOST_CONF = 'http://localhost/'
}

if(env === 'production') {
	HOST_CONF = 'https://example.com/'
}

module.exports = {
	HOST_CONF
};
