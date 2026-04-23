import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

/**
 * Boots the full Nest app the same way production does (global prefix, validation).
 * Lazy-imports `AppModule` so skipped E2E runs do not load the entire application graph.
 */
export async function createE2eNestApp(): Promise<INestApplication> {
  const { AppModule } = await import('../src/app.module');

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}
