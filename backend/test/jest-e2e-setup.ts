/**
 * E2E-only Jest setup: does not force DATABASE_URL so local unit runs stay mock-only.
 * CI sets DATABASE_URL, REDIS_*, JWT_*, ENCRYPTION_KEY explicitly for E2E.
 */
jest.setTimeout(60000);

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
