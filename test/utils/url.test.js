const { validateUrl, validateExpire, convertIdToShortId, convertShortIdToId } = require('../../src/utils/url');

test('id => ShortId', (done) => {
    const ShortId = convertIdToShortId(1);
    expect(ShortId).toBe('NNNNO');
    done();
})

//convertIdToShortId
test('ShortId => id to', (done) => {
    const id = convertShortIdToId('NNNNO');
    expect(id).toBe(1);
    done();
})

//validateExpire
test('驗證過期', (done) => {
    const res = validateExpire(1000000000);
    expect(res).toBe(false);
    done();
})

test('驗證未過期', (done) => {
    const res = validateExpire(5000000000);
    expect(res).toBe(true);
    done();
})

//validateUrl
test('驗證中文域名', (done) => {
    const res = validateUrl('http://中文.tw');
    expect(res).toBe(true);
    done();
})

test('驗證錯誤值', (done) => {
    const res = validateUrl('http://       中文.tw');
    expect(res).toBe(false);
    done();
})