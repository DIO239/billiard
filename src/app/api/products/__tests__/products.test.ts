import { GET as listHandler, POST as createHandler } from '../../products/route';
import { GET as getHandler, PATCH as updateHandler, DELETE as deleteHandler } from '../../products/[id]/route';
import { ProductService } from '@/services/product.service';
import jwt from 'jsonwebtoken';

jest.mock('@/services/product.service');
jest.mock('jsonwebtoken');

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ProductService.list as jest.Mock).mockResolvedValue([]);
    (ProductService.create as jest.Mock).mockResolvedValue({ id: 1 });
    (ProductService.getById as jest.Mock).mockResolvedValue({ id: 1 });
    (ProductService.update as jest.Mock).mockResolvedValue({ id: 1 });
    (ProductService.remove as jest.Mock).mockResolvedValue(undefined);
    // По умолчанию — ADMIN
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
  });

  it('POST /api/products should return 400 on Zod error', async () => {
    const payload = { title: '', description: '' };
    const req = new Request('http://localhost/api/products', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(400);
  });

  it('POST /api/products should return 201 on valid payload', async () => {
    const payload = { title: 'T', description: 'D', price: 10, count: 1, visible: true, typeId: 2 };
    const req = new Request('http://localhost/api/products', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(201);
    expect(ProductService.create).toHaveBeenCalledWith(payload);
  });

  it('POST /api/products should return 500 on service error', async () => {
    (ProductService.create as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const payload = { title: 'T', description: 'D', price: 10, count: 1, visible: true, typeId: 2 };
    const req = new Request('http://localhost/api/products', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(500);
  });

  it('PATCH /api/products/[id] should return 400 on invalid id', async () => {
    const req = new Request('http://localhost/api/products/abc', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({}) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: 'abc' } });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/products/[id] should return 400 on Zod error', async () => {
    const req = new Request('http://localhost/api/products/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ price: -10 }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/products/[id] should return 200 on valid payload', async () => {
    const data = { price: 100, visible: false };
    const req = new Request('http://localhost/api/products/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify(data) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(200);
    expect(ProductService.update).toHaveBeenCalledWith(1, data);
  });

  it('PATCH /api/products/[id] should return 500 on service error', async () => {
    (ProductService.update as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const data = { price: 100 };
    const req = new Request('http://localhost/api/products/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify(data) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(500);
  });

  it('GET /api/products should return 200', async () => {
    const req = { url: 'http://localhost/api/products?skip=0&take=10' } as any;
    const res = await listHandler(req);
    expect(res.status).toBe(200);
  });

  it('GET /api/products should pass search and typeId to service', async () => {
    const req = { url: 'http://localhost/api/products?search=cue&typeId=3&skip=5&take=5' } as any;
    await listHandler(req);
    expect(ProductService.list).toHaveBeenCalledWith({ skip: 5, take: 5, search: 'cue', typeId: 3 });
  });

  it('GET /api/products/[id] should return 400 on invalid id', async () => {
    // @ts-ignore
    const res = await getHandler({} as any, { params: { id: 'x' } });
    expect(res.status).toBe(400);
  });

  it('GET /api/products/[id] should return 404 when not found', async () => {
    (ProductService.getById as jest.Mock).mockResolvedValueOnce(null);
    // @ts-ignore
    const res = await getHandler({} as any, { params: { id: '1' } });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/products/[id] should return 204', async () => {
    const req = new Request('http://localhost/api/products/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(204);
  });

  it('DELETE /api/products/[id] should return 500 on service error', async () => {
    (ProductService.remove as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const req = new Request('http://localhost/api/products/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(500);
  });

  // Authorization tests
  it('POST /api/products should return 401 without cookie', async () => {
    const payload = { title: 'T', description: 'D', price: 10, count: 1, visible: true, typeId: 2 };
    const req = new Request('http://localhost/api/products', { method: 'POST', body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(401);
  });

  it('POST /api/products should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'u@e.com', role: 'USER' });
    const payload = { title: 'T', description: 'D', price: 10, count: 1, visible: true, typeId: 2 };
    const req = new Request('http://localhost/api/products', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(403);
  });

  it('POST /api/products should allow ADMIN', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
    const payload = { title: 'T', description: 'D', price: 10, count: 1, visible: true, typeId: 2 };
    const req = new Request('http://localhost/api/products', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(payload) });
    const res = await createHandler(req as any);
    expect(res.status).toBe(201);
  });

  it('PATCH /api/products/[id] should return 401 without cookie', async () => {
    const req = new Request('http://localhost/api/products/1', { method: 'PATCH', body: JSON.stringify({ price: 1 }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(401);
  });

  it('PATCH /api/products/[id] should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'u@e.com', role: 'USER' });
    const req = new Request('http://localhost/api/products/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ price: 1 }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(403);
  });

  it('PATCH /api/products/[id] should allow ADMIN', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
    const req = new Request('http://localhost/api/products/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ price: 1 }) });
    // @ts-ignore
    const res = await updateHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/products/[id] should return 401 without cookie', async () => {
    const req = new Request('http://localhost/api/products/1', { method: 'DELETE' });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/products/[id] should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'u@e.com', role: 'USER' });
    const req = new Request('http://localhost/api/products/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(403);
  });

  it('DELETE /api/products/[id] should allow ADMIN', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
    const req = new Request('http://localhost/api/products/1', { method: 'DELETE', headers: { cookie: 'token=abc' } });
    // @ts-ignore
    const res = await deleteHandler(req as any, { params: { id: '1' } });
    expect(res.status).toBe(204);
  });
});
