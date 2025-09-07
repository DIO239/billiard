export class CookieService {
    static parseCookies(header: string | null): Record<string, string> {
        const out: Record<string, string> = {};
        if (!header) return out;
        for (const part of header.split(';')) {
            const [k, ...rest] = part.trim().split('=');
            if (!k) continue;
            out[k.trim()] = decodeURIComponent(rest.join('='));
        }
        return out;
    }

    static createSetCookie(name: string, value: string, options?: {
        httpOnly?: boolean;
        path?: string;
        maxAge?: number;
        sameSite?: 'Strict' | 'Lax' | 'None';
        secure?: boolean;
    }): string {
        let cookie = `${name}=${encodeURIComponent(value)}`;
        if (options?.httpOnly) cookie += '; HttpOnly';
        if (options?.path) cookie += `; Path=${options.path}`;
        if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`;
        if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`;
        if (options?.secure) cookie += '; Secure';
        return cookie;
    }
}