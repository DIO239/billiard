import { CartService } from '@/services/cart.service';
import { CookieService } from '@/services/cookie.service';
import { identitySchema } from '@/validation/cart';
import errorHandler from '@/app/api/_utils/error-handler';
import { validate } from '../_utils/validate';

const CART_COOKIE = 'cart_session';

export const GET = errorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') ? Number(searchParams.get('userId')) : undefined;
  let sessionToken = searchParams.get('sessionToken') || undefined;
  let setCookie: string | null = null;

  if (!userId && !sessionToken) {
    const cookies = CookieService.parseCookies(req.headers.get('cookie'));
    if (cookies[CART_COOKIE]) {
      sessionToken = cookies[CART_COOKIE];
    } else {
      throw { status: 400, message: 'No identity provided' };
    }
  }
  const { userId: u, sessionToken: s } = validate(identitySchema, { userId, sessionToken });
  const cart = await CartService.getOrCreate({ userId: u, sessionToken: s });
  const res = new Response(JSON.stringify(cart), { status: 200 });
  if (setCookie) res.headers.append('Set-Cookie', setCookie);
  return res;
});
