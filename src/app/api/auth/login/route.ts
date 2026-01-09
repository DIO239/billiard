import { UserService } from '@/services/user.service';
import { CartService } from '@/services/cart.service';
import { CookieService } from '@/services/cookie.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = 'token';
const CART_COOKIE = 'cart_session';

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

    // Получаем sessionToken из cookie для слияния корзин
    const cookies = CookieService.parseCookies(req.headers.get('cookie'));
    const sessionToken = cookies[CART_COOKIE];

    console.log(`[Login] Начало логина для пользователя ${user.id}, sessionToken: ${sessionToken ? 'есть' : 'нет'}`);

    // Сливаем корзину гостя с корзиной пользователя, если есть sessionToken
    let mergedCart = null;
    if (sessionToken) {
      try {
        console.log(`[Login] Выполняем слияние корзин для userId=${user.id}, sessionToken=${sessionToken}`);
        mergedCart = await CartService.mergeCarts(user.id, sessionToken);
        console.log(`[Login] Корзины успешно объединены:`, {
          cartId: mergedCart.id,
          itemsCount: mergedCart.items.length,
          totalAmount: mergedCart.totalAmount
        });
      } catch (error: any) {
        // Игнорируем ошибки слияния корзин, чтобы не блокировать авторизацию
        console.error('[Login] Ошибка при слиянии корзин:', error?.message || error);
      }
    } else {
      console.log('[Login] Нет sessionToken, слияние не требуется');
    }

    // Генерируем JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    // Устанавливаем httpOnly cookie
    const response = new Response(JSON.stringify({ 
      message: 'Успешный вход',
      cart: mergedCart // Возвращаем объединенную корзину
    }), { status: 200 });
    response.headers.append('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict; Secure`);
    
    // Удаляем cookie корзины гостя, так как теперь корзина привязана к пользователю
    // НО только ПОСЛЕ успешного слияния
    if (sessionToken && mergedCart) {
      console.log('[Login] Удаляем cookie корзины гостя');
      response.headers.append('Set-Cookie', `${CART_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`);
    }
    
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Ошибка авторизации' }), { status: 500 });
  }
}
