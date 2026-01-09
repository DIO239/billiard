import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Не авторизован' }), { status: 401 });
  }
  
  return new Response(JSON.stringify({ user }), { status: 200 });
}
