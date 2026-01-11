import { UserService } from '@/services/user.service';
import { addCorsHeaders, handleOptionsRequest } from '@/app/api/_utils/cors';

export async function OPTIONS(req: Request) {
  return handleOptionsRequest(req);
}

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'Email и код обязательны' }), { status: 400 });
    }
    const verified = await UserService.verifyUser(email, code);
    if (!verified) {
      return new Response(JSON.stringify({ error: 'Пользователь или код не найден, либо код неверный' }), { status: 400 });
    }
    const response = new Response(JSON.stringify({ message: 'Email успешно подтверждён!' }), { status: 200 });
    return addCorsHeaders(response, req);
  } catch (error) {
    const response = new Response(JSON.stringify({ error: 'Ошибка подтверждения' }), { status: 500 });
    return addCorsHeaders(response, req);
  }
}
