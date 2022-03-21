const { validateUrl, validateExpire, convertIdToShortId, convertShortIdToId } = require('../../src/utils/url');

test('id => ShortId', () => {
    const ShortId = convertIdToShortId(1);
    expect(ShortId).toBe('NNNNO');
})

//convertIdToShortId
test('ShortId => id to', () => {
    const id = convertShortIdToId('NNNNO');
    expect(id).toBe(1);
})

//validateExpire
test('驗證過期', () => {
    const res = validateExpire(1000000000);
    expect(res).toBe(false);
})

test('驗證未過期', () => {
    const res = validateExpire(5000000000);
    expect(res).toBe(true);
})

//validateUrl
test('驗證中文域名', () => {
    const res = validateUrl('http://中文.tw');
    expect(res).toBe(true);
})

test('驗證錯誤值', () => {
    const res = validateUrl('http://       中文.tw');
    expect(res).toBe(false);
})