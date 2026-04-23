/// <reference types="jest" />
import { INestApplication } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { createE2eNestApp } from './e2e-bootstrap';

const API = '/api/v1';

describe('Auth (e2e)', () => {
  let app: INestApplication | undefined;

  beforeAll(async () => {
    if (process.env.SKIP_E2E_TESTS === 'true' || !process.env.DATABASE_URL) {
      // eslint-disable-next-line no-console
      console.log(
        'Skipping E2E — set DATABASE_URL (+ Redis/JWT/encryption env) and unset SKIP_E2E_TESTS to run',
      );
      return;
    }

    app = await createE2eNestApp();
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      if (!app) return;

      return request(app.getHttpServer())
        .post(`${API}/auth/login`)
        .send({
          username: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should require username and password', async () => {
      if (!app) return;

      return request(app.getHttpServer()).post(`${API}/auth/login`).send({}).expect(400);
    });
  });

  describe('POST /auth/admin/login', () => {
    it('should return 401 for invalid admin credentials', async () => {
      if (!app) return;

      return request(app.getHttpServer())
        .post(`${API}/auth/admin/login`)
        .send({
          username: 'nonexistent',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 without auth token', async () => {
      if (!app) return;

      return request(app.getHttpServer()).get(`${API}/auth/me`).expect(401);
    });

    it('should return 401 with invalid token', async () => {
      if (!app) return;

      return request(app.getHttpServer())
        .get(`${API}/auth/me`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 401 with invalid refresh token', async () => {
      if (!app) return;

      return request(app.getHttpServer())
        .post(`${API}/auth/refresh`)
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 401 without auth token', async () => {
      if (!app) return;

      return request(app.getHttpServer()).post(`${API}/auth/logout`).expect(401);
    });
  });

  describe('POST /auth/change-password', () => {
    it('should return 401 without auth token', async () => {
      if (!app) return;

      return request(app.getHttpServer())
        .post(`${API}/auth/change-password`)
        .send({
          currentPassword: 'oldPassword',
          newPassword: 'newPassword',
        })
        .expect(401);
    });
  });
});
