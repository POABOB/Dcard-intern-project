const { _64Bit, urlRegx, urlMaxLength } = require('./const');

//目前使用5位字串(64 ^ 5 = 1,073,741,824)，原因是我使用unsigned int (4,294,967,295)
//如果之後想要改更長，可以使用unsigned bigint(2 ^ 64 - 1)，就可以讓字串數增加至多到10位字串(64 ^ 10)

//將id轉換成64進位的5位字串
const convertIdToShortId = (id) => {
    let ShortId = "";
    
    //將id值轉換成64位元的字符
    while(id !== 0) {
        let tmp = "";

        tmp = ShortId;
        ShortId = _64Bit[id%64] + tmp;
        id = Math.floor(id/64);
    }

    //小於5位，就補滿5位
    while(ShortId.length !== urlMaxLength) {
        ShortId = _64Bit[0] + ShortId;
    }

    return ShortId;
}

//將64進位的5位字串轉換成id
const convertShortIdToId = (ShortId) => {
    let i = 0;
    let id = 0;
    //將字串分割成array
    const ShortIdArray = ShortId.split("");
    
    //轉換成原本id
    while(i < urlMaxLength) {
        id += (_64Bit.findIndex(char => char === ShortIdArray[urlMaxLength - (i + 1)])) * Math.pow(64, i);
        i++;
    }

    return id;
}

//驗證url
const validateUrl = (urlString) => {
    let url;
        
    try {
      url = new URL(urlString);
    } catch (e) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "ftp:";
}

//驗證expire
const validateExpire = (expireAt) => {
    return (Date.now() / 1000 < new Date(expireAt).getTime());
}

module.exports = {
    convertIdToShortId,
    convertShortIdToId,
    validateUrl,
    validateExpire
};