# URL Shortener(2022 Dcard backend實習生題目)

## 零、Demo

> 該Demo屬於暫時開放，待面試結束後將會關閉。可以使用curl or postman來替該restful api進行Demo。

* Demo網址：http://lrs.im.ncue.edu.tw:9000/

## 一、如何使用

> 第一次使用，請安裝npm的lib，並請確認機器是否有安裝node、npm

```gherkin=
npm i
```

### 1. 使用docker-compose

#### dev

* 開啟docker中的mysql、redis

```gherkin=
docker-compose up -d
```

* 確認mysql、redis開啟後，開啟服務

```gherkin=
npm run dev
```

#### prd

1. 請將 `docker-compose.yml` 中的nodejs service解除註解

2. 編輯自己server上的域名，如果要改變port，請連同 `docker-compose.yml` port中的 - "\<port\>:80"也一起改

`src/config/url.js`
```
//環境參數
const env = process.env.NODE_ENV;
let HOST_CONF;
if(env === 'dev') {
	HOST_CONF = 'http://localhost/'
}

if(env === 'production') {
	HOST_CONF = '<url>:<port>/'
}

module.exports = {
	HOST_CONF
};
```

3. 執行docker-compose

```gherkin=
docker-compose up -d
```

###  2. 不使用docker-compose

#### mysql、redis配置

* 建立mysql資料庫和資料表
> 資料庫名稱：shortURL<br>
> 資料表名稱：url

`init.sql`
```gherkin=
CREATE DATABASE IF NOT EXISTS shortURL;
USE shortURL;
CREATE TABLE IF NOT EXISTS `shortURL`.`url` ( `id` INT UNSIGNED NOT NULL AUTO_INCREMENT , `url` TEXT NOT NULL , `expireAt` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB
```
* 配置連線資料庫的config

`src/config/db.js`
```gherkin=
//環境參數
const env = process.env.NODE_ENV;

let MYSQL_CONF;
let REDIS_CONF;

if(env === 'dev') {
	//mysql
	MYSQL_CONF = {
			host: 'localhost',
			user: '<username>',
			password: '<password>',
			port: '3306',
			database: 'shortURL',
		};
	//redis
	REDIS_CONF = {
		port: 6379,
		host: '127.0.0.1'
	};
}

if(env === 'production') {
	MYSQL_CONF = {
			host: '<host>',
			user: '<username>',
			password: '<password>',
			port: '3306',
			database: 'shortURL'
		};
	REDIS_CONF = {
		port: 6379,
		host: '<host>'
	};
}

module.exports = {
	MYSQL_CONF,
	REDIS_CONF
};
```

* 配置url

`src/config/url.js`
```
//環境參數
const env = process.env.NODE_ENV;
let HOST_CONF;
if(env === 'dev') {
	HOST_CONF = 'http://localhost/'
}

if(env === 'production') {
	HOST_CONF = '<url>:<port>/'
}

module.exports = {
	HOST_CONF
};
```

* 確認mysql、redis配置好且開啟後，開啟服務

#### dev

```gherkin=
npm run dev
```

#### prd

```gherkin=
npm run prd
```

## 二、題目

![Dcard 題目](./img/a.jpg)

## 三、解題思路

### 1. 題目解釋

* 使用 Golang 或 Nodejs 其中一個語言建立兩個Restful API(包含Unit Test)
	
	1. 可以上傳一個URL網址和過期時間，並且返回一個被縮短好的URL
	
	2. 判斷系統生成的短網址是否存在且有無到期，如果到期和不存在，則返回404；反之，為原本URL進行轉址

* 可以使用任意三方函式庫和資料庫或Cache資料庫

* 替兩個API進行錯誤處理

* 不用Auth

* 要考慮到客戶端同時大量請求短網址(包括不存在的短網址)的問題，將性能納入考量

### 2. 程式邏輯

#### API 1 => POST /api/v1/urls

* 程式流程

![API 1](./img/b.jpg)

* 方法

	1. ~~短網址的 url_id 必須是一個唯一值，如果說使用md5取前幾位數的話，那麼很容易產生碰撞，所以不適合。~~
	
	2. 使用64進位的方式，將url和expireAt插入mysql中返回的自增id(唯一且以主鍵搜尋很快)作轉換

`src/controller/index.js`
```gherkin=
const { get, set } = require('../db/redis');
const { ErrorModel, BaseModel } = require('../utils/response');
const { HOST_CONF } = require('../config/url');
const { getURL, insertURL} = require('../model/index');
const { validateUrl, validateExpire, convertIdToShortId, convertShortIdToId } = require("../utils/url");
const { datetimeRegex } = require("../utils/const");

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
```

* 轉換url_id位數
	
	* 目前使用5位數字串(64 ^ 5 = 1,073,741,824)，原因是我使用unsigned int (4,294,967,295)，為了避免int不夠用
	
	* 如果之後想要改更長，可以使用unsigned bigint(2 ^ 64 - 1)，就可以讓字串數增加至多到10位數字串(64 ^ 10)

`src/utils/url.js`
```gherkin=
const { _64Bit, urlMaxLength } = require('./const');

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
```

* 64進位
	* 我將 A-Z, a-z, 0-9, -, ~ 這些字元打亂順序之後，放入一個陣列當作進位表

`src/utils/const.js`
```gherkin=
const urlMaxLength = 5;
const datetimeRegex = /((19|2\d)\d\d)-((0[1-9])|(1[0-2]))-((0[1-9])|([1-2]\d)|(3[01]))([ T]{1})(([0-1]\d)|(2[0-3])):(([0-5]\d)):(([0-5]\d))([Z]?)/;
const _64Bit = new Array( "N", "O", "P", "4", "5", "6", "7", "8", "9", "m", "Q", "R", "S", "X", "Y", "A", "B", "C", "K", "L", "M", "D", "E", "T", "U", "V", "W", "F", "a", "b", "c", "d", "e", "f", "r", "s", "t", "u", "v", "w", "G", "H", "I", "J", "1", "2", "3", "-", "~", "Z", "g", "h", "i", "j", "k", "l", "n", "o", "p", "q", "x", "y", "z", "0",);
```

#### API 2 => GET /:ShortId([a-zA-Z0-9\-~]{5})

* 程式流程

![API 2](./img/c.jpg)


* 方法

	* 由於後端性能的問題主要出在 網路頻寬速度 和 Disk I/O，在程式碼中就必須為資料庫方面減少負荷，多多採用記憶體作為一個快速的解決方案

	* 所以我會先讓nodejs先去從redis(記憶體資料庫)中查找id是否存在

	* 有則，判斷資料是否有效且有無過期，然後返回404或302

		* 使用302(暫時轉址)原因是因為短網址是有期限的，所以每次轉址都必須讓server判斷資料是否有效，雖然301(永久轉址)性能較好，但是他會被cache在瀏覽器，導致無法到server判斷資料

	* 無則，向mysql(I/O資料庫)查找id是否存在

	* 若有該筆id，使用異步的方式儲存到redis並判斷資料是否有效且有無過期，然後返回404或302

	* 若無該筆id，異步新增一個{ url: null, expireAt: Date.now() / 1000 }資料到redis，返回404
		* 因為題目中有提到如果該筆資料不存在那一直查找不存在的資料也是浪費性能，不如就儲存一個無效值在redis，直接返回404


`src/controller/index.js`
```gherkin=
const { get, set } = require('../db/redis');
const { ErrorModel, BaseModel } = require('../utils/response');
const { HOST_CONF } = require('../config/url');
const { getURL, insertURL} = require('../model/index');
const { validateUrl, validateExpire, convertIdToShortId, convertShortIdToId } = require("../utils/url");
const { datetimeRegx } = require("../utils/const");

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
```

## 三、性能比較(使用ab)

### 1. 對比有使用redis和沒使用redis的性能

* 同時一百個請求，總共訪問一萬次有效短網址

`有redis`
```gherkin=
C:\Users\poabob\Desktop> .\ab.exe -n 10000 -c 100 http://localhost/NNNNB

Concurrency Level:      100
Time taken for tests:   5.225 seconds
Complete requests:      10000
Failed requests:        0
Non-2xx responses:      10000
Total transferred:      2000000 bytes
HTML transferred:       0 bytes
Requests per second:    1913.98 [#/sec] (mean)
Time per request:       52.247 [ms] (mean)
Time per request:       0.522 [ms] (mean, across all concurrent requests)
Transfer rate:          373.83 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.4      0       1
Processing:    20   52  10.1     52      83
Waiting:        8   41   6.8     41      66
Total:         21   52  10.1     52      83

Percentage of the requests served within a certain time (ms)
  50%     52
  66%     56
  75%     59
  80%     61
  90%     65
  95%     68
  98%     74
  99%     76
 100%     83 (longest request)
```

`無redis，只有mysql`
```gherkin=
C:\Users\poabob\Desktop> .\ab.exe -n 10000 -c 100 http://localhost/NNNNB

Concurrency Level:      100
Time taken for tests:   8.549 seconds
Complete requests:      10000
Failed requests:        0
Non-2xx responses:      10000
Total transferred:      2000000 bytes
HTML transferred:       0 bytes
Requests per second:    1169.68 [#/sec] (mean)
Time per request:       85.493 [ms] (mean)
Time per request:       0.855 [ms] (mean, across all concurrent requests)
Transfer rate:          228.45 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.4      0       1
Processing:    21   85   5.0     84     102
Waiting:        9   85   5.0     84     102
Total:         22   85   5.0     84     102

Percentage of the requests served within a certain time (ms)
  50%     84
  66%     86
  75%     87
  80%     88
  90%     90
  95%     93
  98%     96
  99%     97
 100%    102 (longest request)
```

* 同時一千個請求，總共訪問十萬次有效短網址

`有redis`
```gherkin=
C:\Users\poabob\Desktop> .\ab.exe -n 100000 -c 1000 http://localhost/NNNNB

Concurrency Level:      1000
Time taken for tests:   67.488 seconds
Complete requests:      100000
Failed requests:        0
Non-2xx responses:      100000
Total transferred:      20000000 bytes
HTML transferred:       0 bytes
Requests per second:    1481.74 [#/sec] (mean)
Time per request:       674.883 [ms] (mean)
Time per request:       0.675 [ms] (mean, across all concurrent requests)
Transfer rate:          289.40 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    1  11.4      0     516
Processing:   114  668 261.7    437    1447
Waiting:        7  497 270.5    381    1308
Total:        115  669 261.8    438    1448

Percentage of the requests served within a certain time (ms)
  50%    438
  66%    922
  75%    927
  80%    930
  90%    936
  95%    940
  98%    952
  99%    962
 100%   1448 (longest request)
```

`無redis，只有mysql`
```gherkin=
C:\Users\poabob\Desktop> .\ab.exe -n 100000 -c 1000 http://localhost/NNNNB

Concurrency Level:      1000
Time taken for tests:   88.510 seconds
Complete requests:      100000
Failed requests:        0
Non-2xx responses:      100000
Total transferred:      20000000 bytes
HTML transferred:       0 bytes
Requests per second:    1129.81 [#/sec] (mean)
Time per request:       885.103 [ms] (mean)
Time per request:       0.885 [ms] (mean, across all concurrent requests)
Transfer rate:          220.67 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.4      0       6
Processing:   225  880  42.1    878    1028
Waiting:        3  879  42.2    877    1027
Total:        225  880  42.1    878    1028

Percentage of the requests served within a certain time (ms)
  50%    878
  66%    882
  75%    885
  80%    887
  90%    896
  95%    923
  98%    970
  99%   1000
 100%   1028 (longest request)
```

### 2. 還可不可以優化性能?

* 因為nodejs是單個porcess的設計，我們可以使用pm2來實現多個nodejs process 提高效率

* 安裝

```gherkin=
npm i pm2 --save-dev
```

* 新增一些pm2的常用指令， -i 是要啟用的process數量

`package.json`
```gherkin=
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "cross-env NODE_ENV=dev nodemon ./bin/www.js",
    "prd": "cross-env NODE_ENV=dev pm2 start ./bin/www.js -i 4",
    "restart": "cross-env NODE_ENV=dev pm2 restart www",
    "list": "cross-env NODE_ENV=dev pm2 list",
    "stop": "cross-env NODE_ENV=dev pm2 stop www",
    "delete": "cross-env NODE_ENV=dev pm2 delete www"
  },
```

* 開啟服務

```gherkin=
C:\Users\poabob\Desktop\Dcard> npm run prd     

> Dcard@1.0.0 prd C:\Users\poabob\Desktop\Dcard
> cross-env NODE_ENV=dev pm2 start ./bin/www.js -i 4

[PM2] Applying action restartProcessId on app [www](ids: [ 0, 1, 2, 3 ])
[PM2] [www](0) ✓
[PM2] [www](1) ✓
[PM2] [www](3) ✓
[PM2] [www](2) ✓
[PM2] Process successfully started
┌─────┬────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name   │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ www    │ default     │ 1.0.0   │ cluster │ 23348    │ 1s     │ 0    │ online    │ 0%       │ 50.1mb   │ poabob   │ disabled │
│ 1   │ www    │ default     │ 1.0.0   │ cluster │ 17940    │ 1s     │ 0    │ online    │ 0%       │ 49.9mb   │ poabob   │ disabled │
│ 2   │ www    │ default     │ 1.0.0   │ cluster │ 15552    │ 1s     │ 0    │ online    │ 0%       │ 49.7mb   │ poabob   │ disabled │
│ 3   │ www    │ default     │ 1.0.0   │ cluster │ 16468    │ 1s     │ 0    │ online    │ 0%       │ 49.9mb   │ poabob   │ disabled │
└─────┴────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

* 同時一百個請求，總共訪問一萬次有效短網址

```
C:\Users\poabob\Desktop> .\ab.exe -n 10000 -c 100 http://localhost/NNNNB

Concurrency Level:      100
Time taken for tests:   5.272 seconds
Complete requests:      10000
Failed requests:        0
Non-2xx responses:      10000
Total transferred:      2000000 bytes
HTML transferred:       0 bytes
Requests per second:    1896.64 [#/sec] (mean)
Time per request:       52.725 [ms] (mean)
Time per request:       0.527 [ms] (mean, across all concurrent requests)
Transfer rate:          370.44 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.5      0       1
Processing:     6   52   4.0     52      87
Waiting:        6   39   8.6     40      70
Total:          6   52   4.0     53      87

Percentage of the requests served within a certain time (ms)
  50%     53
  66%     53
  75%     54
  80%     54
  90%     55
  95%     56
  98%     58
  99%     59
 100%     87 (longest request)
```


* 同時一千個請求，總共訪問十萬次有效短網址

```
C:\Users\poabob\Desktop> .\ab.exe -n 100000 -c 1000 http://localhost/NNNNB

Concurrency Level:      1000
Time taken for tests:   56.264 seconds
Complete requests:      100000
Failed requests:        0
Non-2xx responses:      100000
Total transferred:      20000000 bytes
HTML transferred:       0 bytes
Requests per second:    1777.33 [#/sec] (mean)
Time per request:       562.642 [ms] (mean)
Time per request:       0.563 [ms] (mean, across all concurrent requests)
Transfer rate:          347.13 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.5      0       2
Processing:    68  560  38.2    556     687
Waiting:        3  299 159.2    299     679
Total:         68  560  38.2    557     687

Percentage of the requests served within a certain time (ms)
  50%    557
  66%    562
  75%    567
  80%    573
  90%    589
  95%    619
  98%    641
  99%    656
 100%    687 (longest request)
```

### 3. 是否還有其他方式優化?

* redis使用cluster

* mysql使用cluster

> 我功力還沒這麼深qq

### 4. 結論

* redis確實可以替mysql作到提速的作用

* 使用pm2來管理nodejs cluster，增加性能是可行的

## 四、單元測試

## 五、程式架構

### 1. 目錄結構

```gherkin=
 C:\Users\poabob\Desktop> tree -I 'node_modules|img'
.
├── app.js
├── bin
│   └── www.js
├── docker-compose.yml
├── Dockerfile
├── init.sql
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── config
│   │   ├── db.js
│   │   └── url.js
│   ├── controller
│   │   └── index.js
│   ├── db
│   │   ├── mysql.js
│   │   └── redis.js
│   ├── model
│   │   └── index.js
│   ├── router
│   │   └── index.js
│   └── utils
│       ├── const.js
│       ├── post.js
│       ├── response.js
│       ├── session.js
│       └── url.js
└── test
    ├── db
    │   ├── mysql.test.js
    │   └── redis.test.js
    ├── router
    │   └── index.test.js
    └── utils
        ├── response.test.js
        └── url.test.js
```

### 2. 引用三方lib

* 主要引用mysql、redis、xss這三種作為本次作業的lib
    * mysql、redis主要是讓nodejs連接兩個資料庫

    * xss用來避免mysql被插入惡意程式片段

* cross-env：方便在npm run指令的時候，建立環境變數，ex. mode=dev

* jest：用來跑unit test，不過我是初學者...

* nodemon、pm2：nodejs的開發(nodemon)和部屬(pm2)工具

`package.json`
```gherkin=
{
  "name": "Dcard",
  "version": "1.0.0",
  "description": "",
  "main": "bin/www.js",
  "directories": {
    "example": "example"
  },
  "scripts": {
    "test": "cross-env NODE_ENV=dev jest --forceExit --coverage --verbose",
    "dev": "cross-env NODE_ENV=dev nodemon ./bin/www.js",
    "prd-d": "cross-env NODE_ENV=production pm2-runtime start ./bin/www.js -i 4",
    "prd": "cross-env NODE_ENV=production pm2 start ./bin/www.js -i 4",
    "restart": "cross-env NODE_ENV=production pm2 restart www",
    "list": "cross-env NODE_ENV=production pm2 list",
    "stop": "cross-env NODE_ENV=production pm2 stop www",
    "delete": "cross-env NODE_ENV=production pm2 delete www"
  },
  "author": "POABOB",
  "license": "ISC",
  "devDependencies": {
    "cross-env": "^6.0.0",
    "jest": "^27.5.1",
    "nodemon": "^2.0.15",
    "pm2": "^5.2.0"
  },
  "dependencies": {
    "mysql": "^2.17.1",
    "redis": "^4.0.4",
    "xss": "^1.0.6"
  }
}
```

### 3. 程式解析

* 執行檔案，主要是連接資料庫和創建http服務

`bin/www.js`
```gherkin=
const http = require('http');

const PORT = 80;
const serverHandler = require('../app');

const { connectRedis } = require('../src/db/redis');
const { connectMysql, handleError } = require('../src/db/mysql');
const { MYSQL_CONF, REDIS_CONF } = require('../src/config/db');

// 初始化redis
try {
    connectRedis({ port: REDIS_CONF.port, host: REDIS_CONF.host });
} catch (e) {
    console.error("Redis connetion/init error:" + e.stack);
    process.exit(1);
}

// 初始化mysql
try {
    connectMysql(MYSQL_CONF);
} catch (e) {
    console.error("Mysql connetion/init error:" + e.stack);
    process.exit(1);
}

const server = http.createServer(serverHandler);

server.listen(PORT);
console.log(`Listening on port ${PORT}...Press CTRL-C to stop.`);
```

* 獲取url path
* 獲取postData
* Router判斷

`app.js`
```gherkin=
const { getPostData } = require('./src/utils/post');
const handleIndexRouter = require('./src/router/index');

const serverHandler = (req, res) => {
	//設定返回格式為JSON
	res.setHeader('Content-type', 'application/json');

	//獲取path
	const url = req.url;
	req.path = url.split('?')[0];

    getPostData(req, res).then(postData => {
        //獲取postData
		req.body = postData;
		//Router註冊
		/*******************************/
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
```

* 使用stream的方式去擷取data，並判斷method和header是否正確

`src/utils/post.js`
```gherkin=
// 獲取post過來的data
const getPostData = (req, res) => {
	const promise = new Promise((resolve, reject) => {
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

			resolve(
				JSON.parse(postData)
			);
		});
	});

	return promise;
};

module.exports = {
    getPostData
}
```

* 判斷method和用正則來判斷url path是否正確，如果沒有就不return，直接404
* 原本想要使用path-to-regexp來判斷url path，但其實也只有一個路由需要判斷，所以決定手寫

`src/router/index.js`
```gherkin=
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
```

* mysql功能模組化

`src/db/mysql.js`
```gherkin=
const mysql = require('mysql');
const { promisify } = require('util');
let conn, query;

const connectMysql = async (config) => {
	return new Promise((resolve, reject) => {
		try {
			conn = mysql.createConnection(config);
			query = promisify(conn.query).bind(conn);
			conn.on('error', handleError);
			resolve(conn);
		} catch (err) {
			reject(err);
		}
	});
}

const exec = async (sql) => {
	return query(sql);
}

const handleError = (err) => {
	if (err) {
	  	// 如果是連線斷開，自動重新連線
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			connectMysql();
		} else {
			console.error(err.stack || err);
		}
	}
}

module.exports = {
	connectMysql, 
	exec,
	escape: mysql.escape
}
```

* redis功能模組化

`src/db/redis.js`
```gherkin=
const redis = require('redis');
const { promisify } = require('util');
let client, setAsync, getAsync;

const connectRedis = async (config) => {
	return new Promise((resolve, reject) => {
		try {
			client = redis.createClient(config.port, config.host);
			setAsync = promisify(client.set).bind(client);
			getAsync = promisify(client.get).bind(client);
			resolve(client);
		} catch (err) {
			reject(err);
		}
	});
}


const set = async (key, val) => {
	if(typeof val === 'object') {
		val = JSON.stringify(val);
	}
  	return setAsync(key, val);
}

const get = async (key) => {
	return getAsync(key);
}

module.exports = {
	set,
	get,
	connectRedis
}
```

* 執行sql語法，並返回結果

`src/model/index.js`
```gherkin=
const { exec, escape } = require('../db/mysql');
const xss = require('xss')

//查
const getURL = async (id) => {
	let sql = `select url, expireAt from url where id = ${xss(escape(id))} limit 1;`;
	//返回promise
	return await exec(sql);
};

//增
const insertURL = async (url, expireAt) => {
	let sql = `INSERT INTO url (url, expireAt) VALUES (${xss(escape(url))},${xss(escape(expireAt))});`;
	return await exec(sql).then(data => {
		return { id: data.insertId }
	});
};

module.exports = {
	getURL,
	insertURL,
};
```

4. 作業心得

其實原本一開始想說用express直接來簡單寫完就好，不過後來想想不用auth session，也只有兩個路由。不如就直接來動手寫http server，相對較有挑戰之外，也開始讓我更熟悉nodejs的Emit機制。我有好幾次都被異步給搞到頭很痛(習慣php寫法)，經過這次練習，我不但更熟悉了Promise，也複習以前曾經學習過的知識，還順便找回寫程式的熱情。