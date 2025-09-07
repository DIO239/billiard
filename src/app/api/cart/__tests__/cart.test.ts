import { GET as getCart } from '../../cart/route';
import { POST as addItem } from '../../cart/add/route';
import { POST as updateQty } from '../../cart/update/route';
import { POST as removeItem } from '../../cart/remove/route';
import { POST as clearCart } from '../../cart/clear/route';
import { CartService } from '@/services/cart.service';

jest.mock('@/services/cart.service');

describe('Cart API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (CartService.getOrCreate as jest.Mock).mockResolvedValue({ id: 1, items: [], totalAmount: 0 });
    (CartService.addItem as jest.Mock).mockResolvedValue({ id: 1, items: [{ productId: 10, quantity: 2 }], totalAmount: 100 });
    (CartService.updateQty as jest.Mock).mockResolvedValue({ id: 1, items: [{ productId: 10, quantity: 3 }], totalAmount: 150 });
    (CartService.removeItem as jest.Mock).mockResolvedValue({ id: 1, items: [], totalAmount: 0 });
    (CartService.clear as jest.Mock).mockResolvedValue({ id: 1, items: [], totalAmount: 0 });
  });

  it('GET /api/cart returns 200 and cart data', async () => {
    const req = { url: 'http://localhost/api/cart?sessionToken=abc' } as any;
    const res = await getCart(req);
    expect(res.status).toBe(200);
  });

  it('GET /api/cart returns 400 without identity', async () => {
    const req = new Request('http://localhost/api/cart');
    const res = await getCart(req as any);
    expect(res.status).toBe(400);
  });

  it('POST /api/cart/add success', async () => {
    const req = new Request('http://localhost/api/cart/add', { method: 'POST', body: JSON.stringify({ sessionToken: 'abc', productId: 10, quantity: 2 }) });
    const res = await addItem(req as any);
    expect(res.status).toBe(200);
  });

  it('POST /api/cart/add validation error (400)', async () => {
    const req = new Request('http://localhost/api/cart/add', { method: 'POST', body: JSON.stringify({}) });
    const res = await addItem(req as any);
    expect(res.status).toBe(400);
  });

  it('POST /api/cart/add not found (404)', async () => {
    (CartService.addItem as jest.Mock).mockRejectedValueOnce({ status: 404, message: 'Товар не найден' });
    const req = new Request('http://localhost/api/cart/add', { method: 'POST', body: JSON.stringify({ sessionToken: 'abc', productId: 99, quantity: 1 }) });
    const res = await addItem(req as any);
    expect(res.status).toBe(404);
  });

  it('POST /api/cart/add conflict (409)', async () => {
    (CartService.addItem as jest.Mock).mockRejectedValueOnce({ status: 409, message: 'Недостаточно товара на складе' });
    const req = new Request('http://localhost/api/cart/add', { method: 'POST', body: JSON.stringify({ sessionToken: 'abc', productId: 10, quantity: 1000 }) });
    const res = await addItem(req as any);
    expect(res.status).toBe(409);
  });

  it('POST /api/cart/update success', async () => {
    const req = new Request('http://localhost/api/cart/update', { method: 'POST', body: JSON.stringify({ sessionToken: 'abc', productId: 10, quantity: 3 }) });
    const res = await updateQty(req as any);
    expect(res.status).toBe(200);
  });

  it('POST /api/cart/update remove on zero', async () => {
    (CartService.updateQty as jest.Mock).mockResolvedValueOnce({ id: 1, items: [], totalAmount: 0 });
    const req = new Request('http://localhost/api/cart/update', { method: 'POST', body: JSON.stringify({ sessionToken: 'abc', productId: 10, quantity: 0 }) });
    const res = await updateQty(req as any);
    expect(res.status).toBe(200);
  });

  it('POST /api/cart/update not found (404)', async () => {
    (CartService.getOrCreate as jest.Mock).mockResolvedValue({ id: 1, items: [{ productId: 99, quantity: 1 }], totalAmount: 10 });
    (CartService.updateQty as jest.Mock).mockResolvedValueOnce(null);
    const req = new Request('http://localhost/api/cart/update', { method: 'POST', body: JSON.stringify({ sessionToken: 'abc', productId: 10, quantity: 1 }) });
    const res = await updateQty(req as any);
    expect(res.status).toBe(404);
  });

  it('POST /api/cart/update conflict (409)', async () => {
    (CartService.updateQty as jest.Mock).mockRejectedValueOnce({ status: 409, message: 'Недостаточно товара на складе' });
    const req = new Request('http://localhost/api/cart/update', { method: 'POST', body: JSON.stringify({ sessionToken: 'abc', productId: 10, quantity: 999 }) });
    const res = await updateQty(req as any);
    expect(res.status).toBe(409);
  });

  it('POST /api/cart/remove success', async () => {
    const req = new Request('http://localhost/api/cart/remove', { method: 'POST', body: JSON.stringify({ sessionToken: 'abc', productId: 10 }) });
    const res = await removeItem(req as any);
    expect(res.status).toBe(200);
  });

  it('POST /api/cart/remove not found (404)', async () => {
    (CartService.removeItem as jest.Mock).mockResolvedValueOnce(null);
    const req = new Request('http://localhost/api/cart/remove', { method: 'POST', body: JSON.stringify({ sessionToken: 'abc', productId: 10 }) });
    const res = await removeItem(req as any);
    expect(res.status).toBe(404);
  });

  it('POST /api/cart/clear success', async () => {
    const req = new Request('http://localhost/api/cart/clear', { method: 'POST', body: JSON.stringify({ sessionToken: 'abc' }) });
    const res = await clearCart(req as any);
    expect(res.status).toBe(200);
  });
});
