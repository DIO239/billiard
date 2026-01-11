import errorHandler from '@/app/api/_utils/error-handler';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import { UserService } from '@/services/user.service';

export const GET = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  isAdmin(req);
  const id = Number(params.id);
  
  if (Number.isNaN(id) || !Number.isFinite(id) || id <= 0) {
    throw { status: 400, message: 'Некорректный id' };
  }
  
  const user = await UserService.getById(id);
  if (!user) {
    throw { status: 404, message: 'Пользователь не найден' };
  }
  
  return new Response(JSON.stringify(user), { status: 200 });
});

export const PATCH = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  isAdmin(req);
  const id = Number(params.id);
  
  if (Number.isNaN(id) || !Number.isFinite(id) || id <= 0) {
    throw { status: 400, message: 'Некорректный id' };
  }
  
  const body = await req.json();
  const { fullName, email, role } = body;
  
  // Валидация
  if (fullName !== undefined && typeof fullName !== 'string') {
    throw { status: 400, message: 'fullName должен быть строкой' };
  }
  if (email !== undefined && typeof email !== 'string') {
    throw { status: 400, message: 'email должен быть строкой' };
  }
  if (role !== undefined && role !== 'USER' && role !== 'ADMIN') {
    throw { status: 400, message: 'role должен быть USER или ADMIN' };
  }
  
  const updateData: any = {};
  if (fullName !== undefined) updateData.fullName = fullName;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;
  
  const user = await UserService.update(id, updateData);
  return new Response(JSON.stringify(user), { status: 200 });
});

export const DELETE = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  isAdmin(req);
  const id = Number(params.id);
  
  if (Number.isNaN(id) || !Number.isFinite(id) || id <= 0) {
    throw { status: 400, message: 'Некорректный id' };
  }
  
  const user = await UserService.getById(id);
  if (!user) {
    throw { status: 404, message: 'Пользователь не найден' };
  }
  
  await UserService.delete(id);
  return new Response(JSON.stringify({ message: 'Пользователь удалён' }), { status: 200 });
});
