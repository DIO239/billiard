import { CartService } from '@/services/cart.service';
import { CookieService } from '@/services/cookie.service';
import { getUserFromRequest } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { prisma } from '@/services/prisma';
import errorHandler from '@/app/api/_utils/error-handler';

const CART_COOKIE = 'cart_session';

export const GET = errorHandler(async (req: Request) => {
  // Пытаемся получить пользователя из JWT или NextAuth сессии
  let userId: number | undefined = undefined;
  
  // Сначала пробуем через JWT
  const jwtUser = getUserFromRequest(req);
  if (jwtUser) {
    userId = jwtUser.id;
  } else {
    // Если не нашли через JWT, пробуем через NextAuth
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (dbUser) {
          userId = dbUser.id;
        }
      }
    } catch (error) {
      console.error('Ошибка получения NextAuth сессии:', error);
    }
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
