// ...existing code...

import { CartService } from '@/services/cart.service';
import { CookieService } from '@/services/cookie.service';
import { updateQtySchema } from '@/validation/cart';
import { randomUUID } from 'crypto';
import errorHandler from "@/app/api/_utils/error-handler"
import { validate } from '@/app/api/_utils/validate';
const CART_COOKIE = 'cart_session';

export const POST = errorHandler(async (req: Request) => {
  const raw = await req.json();
  let setCookie: string | null = null;
  if (!raw?.userId && !raw?.sessionToken) {
    const cookies = CookieService.parseCookies(req.headers.get('cookie'));
    if (cookies[CART_COOKIE]) {
      raw.sessionToken = cookies[CART_COOKIE];
    } else {
      raw.sessionToken = randomUUID();
      setCookie = CookieService.createSetCookie(CART_COOKIE, raw.sessionToken, {
        httpOnly: true,
        path: '/',
        maxAge: 31536000,
        sameSite: 'Strict',
        secure: true,
      });
    }
  }
  const { userId, sessionToken, productId, quantity } = validate(updateQtySchema, raw);
  const cart = await CartService.getOrCreate({ userId, sessionToken });
    if (!cart) return new Response(JSON.stringify({ error: 'Корзина недоступна' }), { status: 500 });
    const updated = await CartService.updateQty(cart.id, productId, quantity);
    if (!updated) return new Response(JSON.stringify({ error: 'Товар не найден в корзине' }), { status: 404 });
    const res = new Response(JSON.stringify(updated), { status: 200 });
    if (setCookie) res.headers.append('Set-Cookie', setCookie);
  return res;
});
