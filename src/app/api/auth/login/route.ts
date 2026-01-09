import { UserService } from '@/services/user.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = 'token';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email и пароль обязательны' }), { status: 400 });
    }
    const user = await UserService.findByEmail(email);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Пользователь не найден' }), { status: 400 });
    }
    if (!user.verified) {
      return new Response(JSON.stringify({ error: 'Email не подтверждён' }), { status: 403 });
    }
    if (!user.password) {
      return new Response(JSON.stringify({ error: 'Для этого аккаунта вход по паролю недоступен' }), { status: 400 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Неверный пароль' }), { status: 400 });
    }
    // Генерируем JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    // Устанавливаем httpOnly cookie
    const response = new Response(JSON.stringify({ message: 'Успешный вход' }), { status: 200 });
    response.headers.append('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict; Secure`);
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Ошибка авторизации' }), { status: 500 });
  }
}
