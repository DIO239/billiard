import { getUserFromRequest } from '@/lib/auth';
import { addCorsHeaders, handleOptionsRequest } from '@/app/api/_utils/cors';

export async function GET(req: Request) {
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(req);
  }
  
  // Получаем пользователя через JWT (работает и для обычной авторизации, и для NextAuth JWT)
  const user = getUserFromRequest(req);
  
  if (!user) {
    const response = new Response(JSON.stringify({ error: 'Не авторизован' }), { status: 401 });
    return addCorsHeaders(response, req);
  }
  
  const response = new Response(JSON.stringify({ user }), { status: 200 });
  return addCorsHeaders(response, req);
}
