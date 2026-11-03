const request = require('supertest');
const app = require('../server');

describe('End-to-End Enterprise API Tests', () => {
  let cookies;
  
  beforeAll(async () => {
    // Attempt to seed data if needed
    await request(app).post('/api/seed').send();
  });

  describe('Auth Flow', () => {
    it('Should login as admin and receive HttpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          username: 'admin',
          password: 'password' // We might not know the exact seeded password if bcrypt is used, but we'll try to check the endpoint
        });
      
      // Because we mock the seed logic and standard is 'password' or just a unit test
      // Actually, wait, in server.js seed, we hashed 'admin' for the password.
      // Let's retry login with 'admin' as password
      const res2 = await request(app)
        .post('/api/login')
        .send({
          username: 'admin',
          password: 'admin'
        });
        
      expect(res2.statusCode).toBe(200);
      expect(res2.body.success).toBe(true);
      expect(res2.headers['set-cookie']).toBeDefined();
      expect(res2.headers['set-cookie'][0]).toMatch(/HttpOnly/);
      
      cookies = res2.headers['set-cookie'];
    });

    it('Should return 401 when trying to access /api/auth/me without cookies', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('Should validate schema using Zod and return 400 for bad payload', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          username: 'ad', // too short
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Validation Error');
    });
  });

  describe('Inventory Endpoint', () => {
    it('Should return inventory items', async () => {
      const res = await request(app).get('/api/inventory');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Bookings Endpoint', () => {
    it('Should return bookings when authenticated as admin', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Cookie', cookies);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
