import { CartService } from '@/services/cart.service';
import { CookieService } from '@/services/cookie.service';
import { getUserFromRequest } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { prisma } from '@/services/prisma';
import errorHandler from '@/app/api/_utils/error-handler';

const CART_COOKIE = 'cart_session';

/**
 * Сливает корзину гостя (из cookie) с корзиной авторизованного пользователя
 * POST /api/cart/merge
 */
export const POST = errorHandler(async (req: Request) => {
  // Сначала пробуем получить пользователя через JWT
  let user = getUserFromRequest(req);
  
  // Если не нашли через JWT, пробуем через NextAuth
  if (!user) {
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, email: true, role: true },
        });
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role || undefined,
          };
        }
      }
    } catch (error) {
      console.error('Ошибка получения NextAuth сессии:', error);
    }
  }
  
  if (!user) {
    return new Response(JSON.stringify({ message: 'Пользователь не авторизован' }), { status: 200 });
  }

  // Получаем sessionToken из cookie
  const cookies = CookieService.parseCookies(req.headers.get('cookie'));
  const sessionToken = cookies[CART_COOKIE];

  if (!sessionToken) {
    // Если нет корзины гостя - просто возвращаем корзину пользователя
    const cart = await CartService.getOrCreate({ userId: user.id, sessionToken: null });
    return new Response(JSON.stringify(cart), { status: 200 });
  }

  // Сливаем корзины
  const mergedCart = await CartService.mergeCarts(user.id, sessionToken);

  if (!mergedCart) {
    throw { status: 500, message: 'Не удалось выполнить слияние корзин' };
  }

  // Удаляем cookie корзины гостя
  const response = new Response(JSON.stringify(mergedCart), { status: 200 });
  response.headers.append('Set-Cookie', `${CART_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`);
  
  return response;
});
