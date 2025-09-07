import { GET as listHandler } from '../../media/route';
import { POST as signHandler } from '../../media/sign/route';
import { POST as confirmHandler } from '../../media/confirm/route';
import { GET as getHandler, PATCH as updateHandler, DELETE as deleteHandler } from '../../media/[id]/route';
import { POST as deleteManyHandler } from '../../media/delete-many/route';
import { MediaService } from '@/services/media.service';
import jwt from 'jsonwebtoken';

jest.mock('@/services/media.service');
jest.mock('jsonwebtoken');
jest.mock('@/services/cloudinary', () => ({
  __esModule: true,
  cld: {
    utils: { api_sign_request: jest.fn(() => 'signature') },
    uploader: { destroy: jest.fn().mockResolvedValue({ result: 'ok' }) },
  },
}));

describe('Media API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (MediaService.list as jest.Mock).mockResolvedValue([]);
    (MediaService.create as jest.Mock).mockResolvedValue({ id: 1 });
    (MediaService.createMany as jest.Mock).mockResolvedValue({ count: 2 });
    (MediaService.getById as jest.Mock).mockResolvedValue({ id: 1 });
    (MediaService.update as jest.Mock).mockResolvedValue({ id: 1 });
    (MediaService.remove as jest.Mock).mockResolvedValue(undefined);
    (MediaService.removeManyByIds as jest.Mock).mockResolvedValue({ count: 1 });
    (MediaService.removeManyByPublicIds as jest.Mock).mockResolvedValue({ count: 1 });
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: 'a@e.com', role: 'ADMIN' });
  });

  it('GET /api/media should return 200 and pass productId filter', async () => {
    const req = { url: 'http://localhost/api/media?productId=10' } as any;
    const res = await listHandler(req);
    expect(res.status).toBe(200);
    expect(MediaService.list).toHaveBeenCalledWith(10);
  });

  // sign
  it('POST /api/media/sign should return 401 without cookie', async () => {
    const r = await signHandler(new Request('http://localhost/api/media/sign', { method: 'POST', body: JSON.stringify({ productId: 1, kind: 'image' }) }) as any);
    expect(r.status).toBe(401);
  });

  it('POST /api/media/sign should return 403 for non-admin', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 2, email: 'u@e.com', role: 'USER' });
    const r = await signHandler(new Request('http://localhost/api/media/sign', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify({ productId: 1, kind: 'image' }) }) as any);
    expect(r.status).toBe(403);
  });

  it('POST /api/media/sign should return 400 on invalid kind', async () => {
    const r = await signHandler(new Request('http://localhost/api/media/sign', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify({ productId: 1, kind: 'doc' }) }) as any);
    expect(r.status).toBe(400);
  });

  it('POST /api/media/sign should return 200 for valid image', async () => {
    const r = await signHandler(new Request('http://localhost/api/media/sign', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify({ productId: 1, kind: 'image' }) }) as any);
    expect(r.status).toBe(200);
  });

  // confirm single/many
  it('POST /api/media/confirm should return 400 on missing fields', async () => {
    const r = await confirmHandler(new Request('http://localhost/api/media/confirm', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify({}) }) as any);
    expect(r.status).toBe(400);
  });

  it('POST /api/media/confirm should create single with public_id', async () => {
    const body = { productId: 1, secure_url: 'https://c.example/img.jpg', resource_type: 'image', public_id: 'products/1/abc' };
    const r = await confirmHandler(new Request('http://localhost/api/media/confirm', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(body) }) as any);
    expect(r.status).toBe(201);
    expect(MediaService.create).toHaveBeenCalledWith({ productId: 1, type: 'image', name: 'https://c.example/img.jpg', publicId: 'products/1/abc' });
  });

  it('POST /api/media/confirm should create many and return count', async () => {
    const arr = [
      { productId: 1, secure_url: 'https://c.example/a.jpg', resource_type: 'image', public_id: 'products/1/a' },
      { productId: 1, secure_url: 'https://c.example/b.mp4', resource_type: 'video', public_id: 'products/1/b' },
    ];
    const r = await confirmHandler(new Request('http://localhost/api/media/confirm', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(arr) }) as any);
    expect(r.status).toBe(201);
    const json = await r.json();
    expect(json.count).toBeDefined();
  });

  // CRUD by id
  it('GET /api/media/[id] should return 400 on invalid id', async () => {
    // @ts-ignore
    const r = await getHandler({} as any, { params: { id: 'x' } });
    expect(r.status).toBe(400);
  });

  it('GET /api/media/[id] should return 404 when not found', async () => {
    (MediaService.getById as jest.Mock).mockResolvedValueOnce(null);
    // @ts-ignore
    const r = await getHandler({} as any, { params: { id: '1' } });
    expect(r.status).toBe(404);
  });

  it('PATCH /api/media/[id] should return 401 without cookie', async () => {
    const r = await updateHandler(new Request('http://localhost/api/media/1', { method: 'PATCH', body: JSON.stringify({ name: 'x' }) }) as any, { params: { id: '1' } } as any);
    expect(r.status).toBe(401);
  });

  it('PATCH /api/media/[id] should allow ADMIN', async () => {
    const r = await updateHandler(new Request('http://localhost/api/media/1', { method: 'PATCH', headers: { cookie: 'token=abc' }, body: JSON.stringify({ name: 'x' }) }) as any, { params: { id: '1' } } as any);
    expect(r.status).toBe(200);
  });

  it('DELETE /api/media/[id] should return 401 without cookie', async () => {
    const r = await deleteHandler(new Request('http://localhost/api/media/1', { method: 'DELETE' }) as any, { params: { id: '1' } } as any);
    expect(r.status).toBe(401);
  });

  it('DELETE /api/media/[id] should allow ADMIN', async () => {
    const r = await deleteHandler(new Request('http://localhost/api/media/1', { method: 'DELETE', headers: { cookie: 'token=abc' } }) as any, { params: { id: '1' } } as any);
    expect(r.status).toBe(204);
  });

  // delete-many
  it('POST /api/media/delete-many should return 401 without cookie', async () => {
    const r = await deleteManyHandler(new Request('http://localhost/api/media/delete-many', { method: 'POST', body: JSON.stringify([]) }) as any);
    expect(r.status).toBe(401);
  });

  it('POST /api/media/delete-many should return 400 on empty array', async () => {
    const r = await deleteManyHandler(new Request('http://localhost/api/media/delete-many', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify([]) }) as any);
    expect(r.status).toBe(400);
  });

  it('POST /api/media/delete-many should delete by ids and publicIds', async () => {
    const arr = [{ id: 1 }, { publicId: 'products/1/a' }];
    const r = await deleteManyHandler(new Request('http://localhost/api/media/delete-many', { method: 'POST', headers: { cookie: 'token=abc' }, body: JSON.stringify(arr) }) as any);
    expect(r.status).toBe(200);
    const json = await r.json();
    expect(json.count).toBeGreaterThan(0);
  });
});
