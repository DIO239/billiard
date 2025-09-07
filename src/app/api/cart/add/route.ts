import { CartService } from '@/services/cart.service';
import { CookieService } from '@/services/cookie.service';
import { addItemSchema } from '@/validation/cart';
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
  const { userId, sessionToken, productId, quantity } = validate(addItemSchema, raw);
  const cart = await CartService.getOrCreate({ userId, sessionToken });
  if (!cart) throw { status: 500, message: 'Корзина недоступна' };
    const updated = await CartService.addItem(cart.id, productId, quantity);
    const res = new Response(JSON.stringify(updated), { status: 200 });
    if (setCookie) res.headers.append('Set-Cookie', setCookie);
  return res;
});
