import { getUserFromRequest } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { prisma } from '@/services/prisma';

export async function GET(req: Request) {
  // Сначала пробуем получить пользователя через JWT (обычная авторизация)
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
    return new Response(JSON.stringify({ error: 'Не авторизован' }), { status: 401 });
  }
  
  return new Response(JSON.stringify({ user }), { status: 200 });
}
