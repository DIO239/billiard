import { CartService } from '@/services/cart.service';
import { CookieService } from '@/services/cookie.service';
import { getUserFromRequest } from '@/lib/auth';
import errorHandler from '@/app/api/_utils/error-handler';

const CART_COOKIE = 'cart_session';

export const GET = errorHandler(async (req: Request) => {
  // Пытаемся получить пользователя из JWT или NextAuth сессии
  let userId: number | undefined = undefined;
  
  // Получаем пользователя через JWT (работает и для обычной авторизации, и для NextAuth JWT)
  const jwtUser = getUserFromRequest(req);
  if (jwtUser) {
    userId = jwtUser.id;
  }

  // Получаем sessionToken из cookie (для гостей)
  const cookies = CookieService.parseCookies(req.headers.get('cookie'));
  let sessionToken = cookies[CART_COOKIE];
  let setCookie: string | null = null;

  // Если нет ни userId, ни sessionToken, создаем новую сессию для гостя
  if (!userId && !sessionToken) {
    const { randomUUID } = await import('crypto');
    sessionToken = randomUUID();
    setCookie = CookieService.createSetCookie(CART_COOKIE, sessionToken, {
      httpOnly: true,
      path: '/',
      maxAge: 31536000,
      sameSite: 'Strict',
      secure: true,
    });
  }

  const cart = await CartService.getOrCreate({ userId: userId || null, sessionToken: sessionToken || null });
  const res = new Response(JSON.stringify(cart), { status: 200 });
  if (setCookie) res.headers.append('Set-Cookie', setCookie);
  return res;
});
