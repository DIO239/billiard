import { UserService } from '@/services/user.service';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email обязателен' }), { status: 400 });
    }
    const user = await UserService.findByEmail(email);
    if (!user) {
      // Специально отвечаем 200 чтобы не раскрывать существование email
      return new Response(JSON.stringify({ message: 'Если такой email зарегистрирован — инструкция отправлена.' }), { status: 200 });
    }
    // Генерируем токен (random string)
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 час
    await UserService.setResetToken(user.id, token, tokenExpires);
    // Отправляем email
    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: {
        user: process.env.YANDEX_USER,
        pass: process.env.YANDEX_PASS,
      },
    });
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: `"Billiard Shop" <${process.env.YANDEX_USER}>`,
      to: email,
      subject: 'Восстановление пароля',
      text: `Перейдите по ссылке для сброса пароля: ${resetUrl}`,
      html: `<b>Перейдите по <a href='${resetUrl}'>ссылке</a> для сброса пароля</b>`,
    });
    return new Response(JSON.stringify({ message: 'Если такой email зарегистрирован — инструкция отправлена.' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Не удалось отправить ссылку для восстановления пароля' }), { status: 500 });
  }
}

