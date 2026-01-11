import { addCorsHeaders, handleOptionsRequest } from '@/app/api/_utils/cors';

const COOKIE_NAME = 'token';

export async function OPTIONS(req: Request) {
  return handleOptionsRequest(req);
}

export async function POST(req: Request) {
  const response = new Response(JSON.stringify({ message: 'Выход выполнен' }), { status: 200 });
  // Удаляем cookie: Max-Age=0
  response.headers.append('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`);
  return addCorsHeaders(response, req);
}
