const redis = require('redis');
const { get, set, connectRedis } = require('../../src/db/redis');

//mock資料
const setMock = jest.fn((key, value, cb) => cb(null, value));
const getMock = jest.fn((key, cb) => cb(null, "redis get a test value"));

//redis創建client的instance創建一個function
redis.createClient = jest.fn(() => {
    return {
        set: setMock,
        get: getMock,
    }
})

connectRedis({ port: 0, host: 'testhost' });

test("get必須返回'redis get a test value'", (done) => {
    get("a").then((data) => {
        expect(data).toBe("redis get a test value");
        done();
    });
});

test("set必須返回'set a test value'", (done) => {
    set("a", "set a test value").then((data) => {
        expect(data).toBe("set a test value");
        done();
    });
});

test("get should return error", (done) => {
    getMock.mockImplementation((key, cb) => cb("error", null));
    get("a").catch((error) => {
        expect(error).toBe("error");
        done();
    });
});

test("set should return error", (done) => {
    setMock.mockImplementation((key, value, cb) =>cb("error", null));
    set("a", "url").catch((error) => {
        expect(error).toBe("error");
        done();
    });
});
