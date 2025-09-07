import { GET as nextAuthHandler } from '../[...nextauth]';
import { createMocks } from 'node-mocks-http';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

jest.mock('next-auth', () => ({
  __esModule: true,
  default: () => (_req: any, res: any) => { res.statusCode = 200; res.end('ok'); },
}));

jest.mock('next-auth/providers/google', () => ({ __esModule: true, default: () => ({}) }));
jest.mock('next-auth/providers/yandex', () => ({ __esModule: true, default: () => ({}) }));

jest.mock('@next-auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn().mockReturnValue({
    createUser: jest.fn().mockResolvedValue({ id: 1, email: 'oauth@example.com' }),
    getUserByEmail: jest.fn().mockResolvedValue(null),
    // ...другие методы адаптера можно мокать по необходимости
  }),
}));

describe('OAuth next-auth handler', () => {
  it('should initialize next-auth with mocked adapter', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/auth/signin',
    });
    // @ts-ignore
    await nextAuthHandler(req, res);
    expect(res._getStatusCode()).not.toBe(500);
  });
});
