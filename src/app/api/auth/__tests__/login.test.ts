import { POST as loginHandler } from '../login';
import { UserService } from '@/services/user.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('@/services/user.service');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    const req = { json: async () => ({}) } as any;
    const res = await loginHandler(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 if user not found', async () => {
    (UserService.findByEmail as jest.Mock).mockResolvedValue(null);

    const req = {
      json: async () => ({
        email: 'test@example.com',
        password: '123456',
      }),
    } as any;

    const res = await loginHandler(req);
    expect(res.status).toBe(400);
  });

  it('should return 403 if user not verified', async () => {
    (UserService.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashed',
      verified: null,
    });

    const req = {
      json: async () => ({
        email: 'test@example.com',
        password: '123456',
      }),
    } as any;

    const res = await loginHandler(req);
    expect(res.status).toBe(403);
  });

  it('should return 400 if password is invalid', async () => {
    (UserService.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashed',
      verified: new Date(),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const req = {
      json: async () => ({
        email: 'test@example.com',
        password: 'wrongpass',
      }),
    } as any;

    const res = await loginHandler(req);
    expect(res.status).toBe(400);
  });

  it('should login and set cookie if credentials are valid', async () => {
    (UserService.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashed',
      verified: new Date(),
      role: 'USER',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mocked.jwt.token');

    const req = {
      json: async () => ({
        email: 'test@example.com',
        password: '123456',
      }),
    } as any;

    const res = await loginHandler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Set-Cookie')).toContain('token=mocked.jwt.token');
  });
});
