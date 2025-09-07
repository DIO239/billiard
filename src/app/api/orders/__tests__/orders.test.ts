import { GET as listHandler, POST as createHandler } from '../../orders/route';
import { GET as getHandler, PATCH as updateHandler, DELETE as deleteHandler } from '../../orders/[id]/route';
import { OrderService } from '@/services/order.service';
import jwt from 'jsonwebtoken';

jest.mock('@/services/order.service');
jest.mock('jsonwebtoken');

describe('Orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (OrderService.list as jest.Mock).mockResolvedValue([]);
    (OrderService.create as jest.Mock).mockResolvedValue({ id: 1, orderNumber: 'ORD-1' });
    (OrderService.getById as jest.Mock).mockResolvedValue({ id: 1 });
    (OrderService.update as jest.Mock).mockResolvedValue({ id: 1 });
    (OrderService.remove as jest.Mock).mockResolvedValue(undefined);
    // По умолчанию — ADMIN
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
  });

  it('GET /api/orders should return 200 and pass filters', async () => {
    const req = { url: 'http://localhost/api/orders?skip=5&take=10&status=PENDING&userId=2' } as any;
    const res = await listHandler(req);
    expect(res.status).toBe(200);
    expect(OrderService.list).toHaveBeenCalledWith({ skip: 5, take: 10, status: 'PENDING', userId: 2 });
  });

  it('POST /api/orders should return 400 on Zod error', async () => {
    const payload = { items: [] };
    const req = new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(400);
  });

  it('POST /api/orders should return 201 on valid payload (no auth needed)', async () => {
    const payload = {
      items: [{ productId: 1, quantity: 2 }],
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+10000000',
      address: 'Street 1',
    };
    const req = new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(201);
    expect(OrderService.create).toHaveBeenCalled();
  });

  it('POST /api/orders should return 500 on service error', async () => {
    (OrderService.create as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const payload = {
      items: [{ productId: 1, quantity: 1 }],
      fullName: 'John',
      email: 'john@example.com',
      phone: '+10000',
      address: 'Addr 1'
    };
    const req = new Request('http://localhost/api/orders', { method: 'POST', body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(500);
  });

  it('GET /api/orders/[id] should return 400 on invalid id', async () => {
    // @ts-ignore
    const res = await getHandler({} as any, { params: { id: 'x' } });
    expect(res.status).toBe(400);
  });

  it('GET /api/orders/[id] should return 404 when not found', async () => {
    (OrderService.getById as jest.Mock).mockResolvedValueOnce(null);
    // @ts-ignore
    const res = await getHandler({} as any, { params: { id: '1' } });
    expect(res.status).toBe(404);
  });

  it('PATCH /api/orders/[id] should return 401 without cookie', async () => {
    const req = new Request('http://localhost/api/orders/1', { method: 'PATCH', body: JSON.stringify({ status: 'SUCCEEDED' }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(401);
  });

  it('PATCH /api/orders/[id] should return 400 on invalid id', async () => {
    const req = new Request('http://localhost/api/orders/abc', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({}) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: 'abc' } });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/orders/[id] should return 400 on Zod error', async () => {
    const req = new Request('http://localhost/api/orders/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ status: 'XXX' }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/orders/[id] should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 2, email: 'u@e.com', role: 'USER' });
    const req = new Request('http://localhost/api/orders/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ status: 'SUCCEEDED' }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(403);
  });

  it('PATCH /api/orders/[id] should allow ADMIN', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
    const req = new Request('http://localhost/api/orders/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ status: 'SUCCEEDED' }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(200);
  });

  it('PATCH /api/orders/[id] should return 500 on service error', async () => {
    (OrderService.update as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const req = new Request('http://localhost/api/orders/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ status: 'SUCCEEDED' }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(500);
  });

  it('DELETE /api/orders/[id] should return 401 without cookie', async () => {
    const req = new Request('http://localhost/api/orders/1', { method: 'DELETE' });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/orders/[id] should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 2, email: 'u@e.com', role: 'USER' });
    const req = new Request('http://localhost/api/orders/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(403);
  });

  it('DELETE /api/orders/[id] should allow ADMIN', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
    const req = new Request('http://localhost/api/orders/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(204);
  });

  it('DELETE /api/orders/[id] should return 500 on service error', async () => {
    (OrderService.remove as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const req = new Request('http://localhost/api/orders/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(500);
  });
});


