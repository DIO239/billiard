import { POST as verifyHandler } from '../verify';
import { UserService } from '@/services/user.service';

jest.mock('@/services/user.service');

describe('POST /api/auth/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    const req = { json: async () => ({}) } as any;
    const res = await verifyHandler(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 if user or code is invalid', async () => {
    (UserService.verifyUser as jest.Mock).mockResolvedValue(null);

    const req = {
      json: async () => ({
        email: 'test@example.com',
        code: '123456',
      }),
    } as any;

    const res = await verifyHandler(req);
    expect(res.status).toBe(400);
  });

  it('should confirm email if code is valid', async () => {
    (UserService.verifyUser as jest.Mock).mockResolvedValue(true);

    const req = {
      json: async () => ({
        email: 'test@example.com',
        code: '123456',
      }),
    } as any;

    const res = await verifyHandler(req);
    expect(res.status).toBe(200);
  });
});
