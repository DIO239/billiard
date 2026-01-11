import bcrypt from 'bcryptjs';
import errorHandler from '@/app/api/_utils/error-handler';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import { UserService } from '@/services/user.service';

export const GET = errorHandler(async (req: Request) => {
  isAdmin(req);
  const users = await UserService.list();
  return new Response(JSON.stringify(users), { status: 200 });
});

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  const { fullName, email, password, role } = body;

  // Валидация
  if (!fullName || typeof fullName !== 'string') {
    throw { status: 400, message: 'fullName обязателен и должен быть строкой' };
  }
  if (!email || typeof email !== 'string') {
    throw { status: 400, message: 'email обязателен и должен быть строкой' };
  }
  if (!password || typeof password !== 'string') {
    throw { status: 400, message: 'password обязателен и должен быть строкой' };
  }
  if (password.length < 6) {
    throw { status: 400, message: 'Пароль должен быть не менее 6 символов' };
  }
  if (role && role !== 'USER' && role !== 'ADMIN') {
    throw { status: 400, message: 'role должен быть USER или ADMIN' };
  }

  // Проверка на существующего пользователя
  const existingUser = await UserService.findByEmail(email);
  if (existingUser) {
    throw { status: 400, message: 'Пользователь с таким email уже существует' };
  }

  // Хеширование пароля
  const hashedPassword = await bcrypt.hash(password, 10);

  // Создание пользователя
  const user = await UserService.createAdminUser({
    fullName,
    email,
    password: hashedPassword,
    role: role || 'USER',
  });

  return new Response(JSON.stringify(user), { status: 201 });
});
