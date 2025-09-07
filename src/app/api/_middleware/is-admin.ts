import { getUserFromRequest } from '@/lib/auth';

export function isAdmin(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) {
    throw { status: 401, message: 'Не авторизован' };
  }
  if (user.role !== 'ADMIN') {
    throw { status: 403, message: 'Доступ запрещён' };
  }
  return user;
}
