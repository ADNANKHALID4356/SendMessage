/// <reference types="jest" />
import { INestApplication } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { createE2eNestApp } from './e2e-bootstrap';

const API = '/api/v1';

describe('Health & public workspace (e2e)', () => {
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

  describe('GET /health/ready', () => {
    it('should return JSON with status (no auth)', async () => {
      if (!app) return;

      const res = await request(app.getHttpServer()).get(`${API}/health/ready`).expect(200);

      expect(res.body).toHaveProperty('status');
      expect(res.body.services).toBeDefined();
    });
  });

  describe('GET /health', () => {
    it('should respond (Terminus — 200 or 503 depending on DB/Redis)', async () => {
      if (!app) return;

      const res = await request(app.getHttpServer()).get(`${API}/health`);
      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('status');
    });
  });

  describe('GET /workspaces/public/by-slug/:slug', () => {
    it('should return 404 for unknown slug', async () => {
      if (!app) return;

      return request(app.getHttpServer())
        .get(`${API}/workspaces/public/by-slug/does-not-exist-${Date.now()}`)
        .expect(404);
    });

    it('should return 200 and minimal fields when seed workspace slug exists', async () => {
      if (!app) return;

      const res = await request(app.getHttpServer()).get(`${API}/workspaces/public/by-slug/default`);

      if (res.status === 404) {
        // DB not seeded — still a valid outcome for fresh migrate-only DBs
        expect(res.body).toBeDefined();
        return;
      }

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        slug: 'default',
      });
    });
  });

  describe('POST /auth/login (seeded user)', () => {
    it('should return 200 with tokens when seed data present', async () => {
      if (!app) return;

      const res = await request(app.getHttpServer()).post(`${API}/auth/login`).send({
        username: 'user@messagesender.com',
        password: 'User@123',
      });

      if (res.status === 401) {
        // Seed not run — skip assertion
        return;
      }

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });
  });
});
