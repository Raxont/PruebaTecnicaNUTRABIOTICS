import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Auth E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/sign-up', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'Test@123456',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).toHaveProperty('email');
          expect(res.body.user).toHaveProperty('role');
        });
    });

    it('should reject duplicate email', () => {
      const email = `duplicate-${Date.now()}@example.com`;

      return request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email,
          password: 'Test@123456',
          firstName: 'Test',
          lastName: 'User',
        })
        .then(() => {
          return request(app.getHttpServer())
            .post('/auth/sign-up')
            .send({
              email,
              password: 'Test@123456',
              firstName: 'Test',
              lastName: 'User',
            })
            .expect(400);
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: 'test@example.com',
          // Missing password
        })
        .expect(400);
    });
  });

  describe('POST /auth/sign-in', () => {
    let testEmail: string;

    beforeAll(async () => {
      testEmail = `signin-test-${Date.now()}@example.com`;

      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: testEmail,
          password: 'Test@123456',
          firstName: 'Test',
          lastName: 'User',
        });
    });

    it('should sign in successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: testEmail,
          password: 'Test@123456',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe(testEmail);
        });
    });

    it('should reject invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: testEmail,
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@123456',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const signUpRes = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: `me-test-${Date.now()}@example.com`,
          password: 'Test@123456',
          firstName: 'Test',
          lastName: 'User',
        });

      accessToken = signUpRes.body.accessToken;
    });

    it('should return current user info', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('role');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });
});