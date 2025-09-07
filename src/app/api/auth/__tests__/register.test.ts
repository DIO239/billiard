import request from 'supertest';
import { createServer } from 'http';
import { POST as registerHandler } from '../register';
import { UserService } from '@/services/user.service';
import nodemailer from 'nodemailer';

jest.mock('@/services/user.service');
jest.mock('nodemailer');

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    const req = { json: async () => ({}) } as any;
    const res = await registerHandler(req);
    expect(res.status).toBe(400);
  });

  it('should register a new user and send email', async () => {
    (UserService.findByEmail as jest.Mock).mockResolvedValue(null);
    (UserService.createUser as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });
    const sendMailMock = jest.fn().mockResolvedValue({});
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: sendMailMock });

    const req = {
      json: async () => ({
        fullName: 'Test User',
        email: 'test@example.com',
        password: '123456',
      }),
    } as any;

    const res = await registerHandler(req);

    expect(res.status).toBe(201);
    expect(UserService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(UserService.createUser).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalled();
  });
});
