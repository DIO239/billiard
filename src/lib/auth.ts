import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'token';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (!k) continue;
    result[k] = decodeURIComponent(rest.join('='));
  }
  return result;
}

export type JwtUserPayload = { id: number; email: string; role?: string } | null;

export function getUserFromRequest(req: Request): JwtUserPayload {
  try {
    const cookies = parseCookies(req.headers.get('cookie'));
    const token = cookies[COOKIE_NAME];
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { id: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

export function assertAdmin(req: Request): { ok: true; user: NonNullable<JwtUserPayload> } | { ok: false; response: Response } {
  const user = getUserFromRequest(req);
  if (!user) {
    return { ok: false, response: new Response(JSON.stringify({ error: 'Не авторизован' }), { status: 401 }) };
  }
  if (user.role !== 'ADMIN') {
    return { ok: false, response: new Response(JSON.stringify({ error: 'Доступ запрещён' }), { status: 403 }) };
  }
  return { ok: true, user };
}
