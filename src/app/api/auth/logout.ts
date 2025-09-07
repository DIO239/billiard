const COOKIE_NAME = 'token';

export async function POST() {
  const response = new Response(JSON.stringify({ message: 'Выход выполнен' }), { status: 200 });
  // Удаляем cookie: Max-Age=0
  response.headers.append('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`);
  return response;
}
