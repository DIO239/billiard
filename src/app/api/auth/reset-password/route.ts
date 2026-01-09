import { UserService } from '@/services/user.service';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return new Response(JSON.stringify({ error: 'Token и новый пароль обязательны' }), { status: 400 });
    }
    // Проверяем токен и получаем пользователя
    const user = await UserService.findByResetToken(token);
    if (!user || !user.resetTokenExpires || new Date(user.resetTokenExpires) < new Date()) {
      return new Response(JSON.stringify({ error: 'Недействительный или истекший токен' }), { status: 400 });
    }
    // Хэшируем новый пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    // Сохраняем новый пароль и обнуляем токен
    await UserService.updatePasswordAndClearToken(user.id, hashedPassword);
    return new Response(JSON.stringify({ message: 'Пароль успешно сброшен' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Ошибка сброса пароля' }), { status: 500 });
  }
}

