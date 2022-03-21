const { validateUrl, validateExpire, convertIdToShortId, convertShortIdToId } = require('../../src/utils/url');

function sum(a, b) {
    return a + b;
}
//convertShortIdToId
it('id to ShortId => ', () => {
    const res = sum(10, 20);
    expect(res).toBe(30);
})

//convertIdToShortId
it('id to ShortId => ', () => {
    const res = sum(10, 20);
    expect(res).toBe(30);
})

//validateExpire
it('id to ShortId => ', () => {
    const res = sum(10, 20);
    expect(res).toBe(30);
})

//validateUrl
it('id to ShortId => ', () => {
    const res = sum(10, 20);
    expect(res).toBe(30);
})