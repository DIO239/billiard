import { GET as listHandler, POST as createHandler } from '../../types/route';
import { GET as getHandler, PATCH as updateHandler, DELETE as deleteHandler } from '../../types/[id]/route';
import { TypeService } from '@/services/type.service';
import jwt from 'jsonwebtoken';

jest.mock('@/services/type.service');
jest.mock('jsonwebtoken');

describe('Types API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (TypeService.list as jest.Mock).mockResolvedValue([]);
    (TypeService.create as jest.Mock).mockResolvedValue({ id: 1 });
    (TypeService.getById as jest.Mock).mockResolvedValue({ id: 1 });
    (TypeService.update as jest.Mock).mockResolvedValue({ id: 1 });
    (TypeService.remove as jest.Mock).mockResolvedValue(undefined);
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
  });

  it('GET /api/types should return 200', async () => {
    const res = await listHandler();
    expect(res.status).toBe(200);
  });

  it('POST /api/types should return 400 on Zod error', async () => {
    const req = new Request('http://localhost/api/types', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify({ value: '' }) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(400);
  });

  it('POST /api/types should return 201 on valid payload', async () => {
    const payload = { value: 'cue', name: 'Кии' };
    const req = new Request('http://localhost/api/types', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(201);
    expect(TypeService.create).toHaveBeenCalledWith(payload);
  });

  it('POST /api/types should return 500 on service error', async () => {
    (TypeService.create as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const payload = { value: 'cue', name: 'Кии' };
    const req = new Request('http://localhost/api/types', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(500);
  });

  it('GET /api/types/[id] should return 400 on invalid id', async () => {
    // @ts-ignore
    const res = await getHandler({} as any, { params: { id: 'x' } });
    expect(res.status).toBe(400);
  });

  it('GET /api/types/[id] should return 404 when not found', async () => {
    (TypeService.getById as jest.Mock).mockResolvedValueOnce(null);
    // @ts-ignore
    const res = await getHandler({} as any, { params: { id: '1' } });
    expect(res.status).toBe(404);
  });

  it('PATCH /api/types/[id] should return 400 on invalid id', async () => {
    const req = new Request('http://localhost/api/types/abc', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({}) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: 'abc' } });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/types/[id] should return 400 on Zod error', async () => {
    const req = new Request('http://localhost/api/types/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ value: '' }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/types/[id] should return 200 on valid payload', async () => {
    const req = new Request('http://localhost/api/types/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ name: 'Шары' }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(200);
  });

  it('PATCH /api/types/[id] should return 500 on service error', async () => {
    (TypeService.update as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const req = new Request('http://localhost/api/types/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ name: 'Шары' }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(500);
  });

  it('DELETE /api/types/[id] should return 204', async () => {
    const req = new Request('http://localhost/api/types/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(204);
  });

  it('DELETE /api/types/[id] should return 500 on service error', async () => {
    (TypeService.remove as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const req = new Request('http://localhost/api/types/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(500);
  });

  // Authorization
  it('POST /api/types should return 401 without cookie', async () => {
    const req = new Request('http://localhost/api/types', { method: 'POST', body: JSON.stringify({ value: 'cue', name: 'Кии' }) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(401);
  });

  it('POST /api/types should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 2, email: 'u@e.com', role: 'USER' });
    const req = new Request('http://localhost/api/types', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify({ value: 'cue', name: 'Кии' }) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(403);
  });

  it('POST /api/types should allow ADMIN', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
    const req = new Request('http://localhost/api/types', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify({ value: 'cue', name: 'Кии' }) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(201);
  });

  it('PATCH /api/types/[id] should return 401 without cookie', async () => {
    const req = new Request('http://localhost/api/types/1', { method: 'PATCH', body: JSON.stringify({ name: 'Шары' }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(401);
  });

  it('PATCH /api/types/[id] should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 2, email: 'u@e.com', role: 'USER' });
    const req = new Request('http://localhost/api/types/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ name: 'Шары' }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(403);
  });

  it('PATCH /api/types/[id] should allow ADMIN', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
    const req = new Request('http://localhost/api/types/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ name: 'Шары' }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/types/[id] should return 401 without cookie', async () => {
    const req = new Request('http://localhost/api/types/1', { method: 'DELETE' });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/types/[id] should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 2, email: 'u@e.com', role: 'USER' });
    const req = new Request('http://localhost/api/types/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(403);
  });

  it('DELETE /api/types/[id] should allow ADMIN', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
    const req = new Request('http://localhost/api/types/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(204);
  });
});
