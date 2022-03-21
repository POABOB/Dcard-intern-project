const mysql = require('mysql');
const { exec, connectMysql } = require('../../src/db/mysql');


//mock資料
const execMock = jest.fn((sql, cb) => cb(null, [{ id: 1, url: 'http://localhost', expireAt: 1234567890 }]));

mysql.createConnection = jest.fn(() => {
    return {
        query: execMock
    }
})

connectMysql({ host: 'testhost', user: 'a', password: 'a', port: '0', database: 'shortURL'});

test("exec必須返回'[{ id: 1, url: 'http://localhost', expireAt: 1234567890 }]'", (done) => {
    exec("select url, expireAt from url where id = 1 limit 1;").then((data) => {
        // console.log(data);
        expect(data).toEqual([{ id: 1, url: 'http://localhost', expireAt: 1234567890 }]);
        done();
    });
});


test("exec必須返回'error'", (done) => {
    execMock.mockImplementation((sql, cb) =>cb("error", null));
    exec("select url, expireAt from url where id = 1 limit 1;").catch((error) => {
        expect(error).toBe("error");
        done();
    });
});