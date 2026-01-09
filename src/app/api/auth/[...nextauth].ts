import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import YandexProvider from 'next-auth/providers/yandex';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/services/prisma';
import { CartService } from '@/services/cart.service';
import { CookieService } from '@/services/cookie.service';

const CART_COOKIE = 'cart_session';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID!,
      clientSecret: process.env.YANDEX_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // После успешной авторизации через OAuth
      if (user?.id) {
        // Слияние корзин будет происходить на клиенте через AuthContext
        // Здесь мы просто разрешаем вход
        return true;
      }
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub ?? '';
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // При первой авторизации через OAuth
      if (user && account) {
        token.userId = user.id;
      }
      return token;
    },
  },
  events: {
    async signIn({ user, account }) {
      // После успешной авторизации через OAuth пытаемся выполнить слияние корзин
      // Но это серверный контекст, нам нужен доступ к cookies из запроса
      // Поэтому слияние будет происходить на клиенте
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
