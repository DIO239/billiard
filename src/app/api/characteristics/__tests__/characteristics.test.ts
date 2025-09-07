import { GET as listHandler, POST as createHandler } from '../../characteristics/route';
import { GET as getHandler, PATCH as updateHandler, DELETE as deleteHandler } from '../../characteristics/[id]/route';
import { CharacteristicService } from '@/services/characteristic.service';
import jwt from 'jsonwebtoken';

jest.mock('@/services/characteristic.service');
jest.mock('jsonwebtoken');

describe('Characteristics API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (CharacteristicService.list as jest.Mock).mockResolvedValue([]);
    (CharacteristicService.create as jest.Mock).mockResolvedValue({ id: 1 });
    (CharacteristicService.getById as jest.Mock).mockResolvedValue({ id: 1 });
    (CharacteristicService.update as jest.Mock).mockResolvedValue({ id: 1 });
    (CharacteristicService.remove as jest.Mock).mockResolvedValue(undefined);
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
  });

  it('GET /api/characteristics should return 200 and pass productId filter', async () => {
    const req = { url: 'http://localhost/api/characteristics?productId=5' } as any;
    const res = await listHandler(req);
    expect(res.status).toBe(200);
    expect(CharacteristicService.list).toHaveBeenCalledWith(5);
  });

  it('POST /api/characteristics should return 400 on Zod error', async () => {
    const req = new Request('http://localhost/api/characteristics', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify({ productId: -1 }) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(400);
  });

  it('POST /api/characteristics should return 201 on valid payload', async () => {
    const payload = { productId: 2, height: 1.2 };
    const req = new Request('http://localhost/api/characteristics', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(201);
    expect(CharacteristicService.create).toHaveBeenCalledWith(payload as any);
  });

  it('POST /api/characteristics should return 500 on service error', async () => {
    (CharacteristicService.create as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const payload = { productId: 2, height: 1.2 };
    const req = new Request('http://localhost/api/characteristics', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(500);
  });

  it('GET /api/characteristics/[id] should return 400 on invalid id', async () => {
    // @ts-ignore
    const res = await getHandler({} as any, { params: { id: 'x' } });
    expect(res.status).toBe(400);
  });

  it('GET /api/characteristics/[id] should return 404 when not found', async () => {
    (CharacteristicService.getById as jest.Mock).mockResolvedValueOnce(null);
    // @ts-ignore
    const res = await getHandler({} as any, { params: { id: '1' } });
    expect(res.status).toBe(404);
  });

  it('PATCH /api/characteristics/[id] should return 400 on invalid id', async () => {
    const req = new Request('http://localhost/api/characteristics/abc', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({}) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: 'abc' } });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/characteristics/[id] should return 400 on Zod error', async () => {
    const req = new Request('http://localhost/api/characteristics/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ height: -2 }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/characteristics/[id] should return 200 on valid payload', async () => {
    const req = new Request('http://localhost/api/characteristics/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ height: 3 }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(200);
  });

  it('PATCH /api/characteristics/[id] should return 500 on service error', async () => {
    (CharacteristicService.update as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const req = new Request('http://localhost/api/characteristics/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ height: 3 }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(500);
  });

  it('DELETE /api/characteristics/[id] should return 204', async () => {
    const req = new Request('http://localhost/api/characteristics/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(204);
  });

  it('DELETE /api/characteristics/[id] should return 500 on service error', async () => {
    (CharacteristicService.remove as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const req = new Request('http://localhost/api/characteristics/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(500);
  });

  // Authorization
  it('POST /api/characteristics should return 401 without cookie', async () => {
    const req = new Request('http://localhost/api/characteristics', { method: 'POST', body: JSON.stringify({ productId: 1 }) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(401);
  });

  it('POST /api/characteristics should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 2, email: 'u@e.com', role: 'USER' });
    const req = new Request('http://localhost/api/characteristics', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify({ productId: 1 }) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(403);
  });

  it('POST /api/characteristics should allow ADMIN', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
    const req = new Request('http://localhost/api/characteristics', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify({ productId: 1 }) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(201);
  });

  it('PATCH /api/characteristics/[id] should return 401 without cookie', async () => {
    const req = new Request('http://localhost/api/characteristics/1', { method: 'PATCH', body: JSON.stringify({ height: 1 }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(401);
  });

  it('PATCH /api/characteristics/[id] should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 2, email: 'u@e.com', role: 'USER' });
    const req = new Request('http://localhost/api/characteristics/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ height: 1 }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(403);
  });

  it('PATCH /api/characteristics/[id] should allow ADMIN', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
    const req = new Request('http://localhost/api/characteristics/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ height: 1 }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/characteristics/[id] should return 401 without cookie', async () => {
    const req = new Request('http://localhost/api/characteristics/1', { method: 'DELETE' });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/characteristics/[id] should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 2, email: 'u@e.com', role: 'USER' });
    const req = new Request('http://localhost/api/characteristics/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(403);
  });

  it('DELETE /api/characteristics/[id] should allow ADMIN', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
    const req = new Request('http://localhost/api/characteristics/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(204);
  });
});
