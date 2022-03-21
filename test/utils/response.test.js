const { ErrorModel, BaseModel } = require('../../src/utils/response');

test("測試一般response", (done) => {
    const res = new BaseModel(`NNNNP`, `http://localhost/NNNNP`);
    expect(res).toEqual({"id": "NNNNP", "shortUrl": "http://localhost/NNNNP"});
    done();
});

test("測試錯誤response", (done) => {
    const res = new ErrorModel(`The post data expireAt =  is invalid!!!`);
    expect(res).toEqual({"error": "The post data expireAt =  is invalid!!!"});
    done();
});
