import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { UserService } from '@/services/user.service';

export async function POST(req: Request) {
  try {
    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password) {
      return new Response(JSON.stringify({ error: 'Все поля обязательны' }), { status: 400 });
    }
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Пароль должен быть не менее 6 символов' }), { status: 400 });
    }
    // Проверка на существующего пользователя
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Пользователь с таким email уже существует' }), { status: 400 });
    }
    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    // Генерация кода подтверждения
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Создание пользователя через сервис
    await UserService.createUser({ fullName, email, password: hashedPassword, code });
    // Отправка письма через Yandex SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: {
        user: process.env.YANDEX_USER,
        pass: process.env.YANDEX_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Billiard Shop" <${process.env.YANDEX_USER}>`,
      to: email,
      subject: 'Подтверждение регистрации',
      text: `Ваш код подтверждения: ${code}`,
      html: `<b>Ваш код подтверждения: ${code}</b>`,
    });
    return new Response(JSON.stringify({ message: 'Пользователь зарегистрирован. Проверьте почту для подтверждения.' }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Ошибка регистрации' }), { status: 500 });
  }
}

