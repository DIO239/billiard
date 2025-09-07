import { POST as logoutHandler } from '../logout';

describe('POST /api/auth/logout', () => {
  it('should clear auth cookie', async () => {
    const res = await logoutHandler();
    expect(res.status).toBe(200);
    const setCookie = res.headers.get('Set-Cookie') || '';
    expect(setCookie).toContain('token=');
    expect(setCookie).toContain('Max-Age=0');
  });
});
