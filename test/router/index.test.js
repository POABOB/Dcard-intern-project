const { expect } = require('@jest/globals');
const { test } = require('jest-circus');
const request = require('supertest');
const server = require('../../bin/www');

let ShortId;

describe("POST /api/v1/urls", () => {
    it('使用正確格式測試 POST /api/v1/urls', async () => {
        const res = await request(server)
            .post('/api/v1/urls')
            .send({
                url: "http://www.google.com",
                expireAt: "2025-02-02T20:20:20Z"
            })
            let response = JSON.parse(res.res.text)
            ShortId = response.id;
            expect(response).toHaveProperty('id');
            expect(response).toHaveProperty('shortUrl');
            expect(Object.keys(response).length).toBe(2);
            expect(res.statusCode).toBe(200);
    });

    it('使用錯誤日期測試 POST /api/v1/urls', async () => {
        const res = await request(server)
            .post('/api/v1/urls')
            .send({
                url: "http://www.google.com",
                expireAt: "2025-02-0220:20:20Z"
            })
            let response = JSON.parse(res.res.text)

            expect(response).toHaveProperty('error');
            expect(Object.keys(response).length).toBe(1);
            expect(res.statusCode).toBe(400);
    });

    it('使用錯誤url測試 POST /api/v1/urls', async () => {
        const res = await request(server)
            .post('/api/v1/urls')
            .send({
                url: "htt://www.google.com",
                expireAt: "2025-02-02T20:20:20Z"
            })
            let response = JSON.parse(res.res.text)

            expect(response).toHaveProperty('error');
            expect(Object.keys(response).length).toBe(1);
            expect(res.statusCode).toBe(400);
    });

    it('使用錯誤url變數測試 POST /api/v1/urls', async () => {
        const res = await request(server)
            .post('/api/v1/urls')
            .send({
                uri: "htt://www.google.com",
                expireAt: "2025-02-02T20:20:20Z"
            })
            let response = JSON.parse(res.res.text)

            expect(response).toHaveProperty('error');
            expect(Object.keys(response).length).toBe(1);
            expect(res.statusCode).toBe(400);
    });

    it('使用錯誤expireAt變數測試 POST /api/v1/urls', async () => {
        const res = await request(server)
            .post('/api/v1/urls')
            .send({
                uri: "htt://www.google.com",
                expireat: "2025-02-02T20:20:20Z"
            })
            let response = JSON.parse(res.res.text)

            expect(response).toHaveProperty('error');
            expect(Object.keys(response).length).toBe(1);
            expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /:ShortId", () => {
    it('使用正確ShortId測試 GET /:ShortId', async () => {
        const res = await request(server).get(`/${ShortId}`);
        expect(res.statusCode).toBe(302);
    });

    it('使用過短ShortId測試 GET /:ShortId', async () => {
        const res = await request(server).get(`/a`);
            expect(res.text).toBe('GET /a 404 Not Found\n');
            expect(res.statusCode).toBe(404);
    });

    it('使用過長ShortId測試 GET /:ShortId', async () => {
        const res = await request(server).get(`/sidufhsiufbwuibsusdi`);
        expect(res.text).toBe('GET /sidufhsiufbwuibsusdi 404 Not Found\n');
        expect(res.statusCode).toBe(404);
    });
  });