const { getPostData } = require('./post');
const { get, set } = require('../db/redis');

//獲取cookie過期時間
const getCookieExpires = () => {
	const d = new Date();
	d.setTime(d.getTime() + (24 * 60 * 60 *1000));
	return d.toGMTString();
};

/*******************************/
const getSession = (req, res) => {
    // 解析cookie
    req.cookie = {};
    const cookieStr = req.headers.cookie || ''; //k1=v1;k2=v3;...;
    cookieStr.split(';').forEach(item => {
        if(!item) {
            return;
        }
        const arr = item.split('=');
        const key = arr[0].trim();
        const val = arr[1].trim();
        req.cookie[key] = val;
    });

    //解析SESSION(redis)
    let needSetCookie = false;
    let userId = req.cookie.userid;
    if(!userId) {
        needSetCookie = true;
        userId = `${Date.now()}_${Math.random()}`;
        //初始化session(redis)
        set(userId, {});
    }

    //獲取session
    req.sessionId = userId;
    get(req.sessionId).then(sessionData => {
        if(sessionData == null) {
            //初始化session(redis)
            set(req.sessionId, {});
            //設置session
            req.session = {};
        } else {
            req.session = sessionData;
        }

        
        if(needSetCookie) {
            res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`);
        }

        //return promise之後處理post data
        return getPostData(req, res);
    });
}

module.exports = {
    getSession,
}