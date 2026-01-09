"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

type User = {
  id: number;
  email: string;
  role?: string;
} | null;

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  // Кэширование на 5 минут
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchUser = async (force = false) => {
    const now = Date.now();
    // Проверяем кэш - если данные свежие и не требуется принудительное обновление, пропускаем запрос
    // Но только если у нас уже есть пользователь (не null)
    if (!force && now - lastFetch < CACHE_DURATION && user !== null && lastFetch > 0) {
      setIsLoading(false);
      return;
    }

    const wasNotAuthenticated = user === null;

    try {
      const response = await axios.get('/api/auth/me');
      const newUser = response.data.user;
      setUser(newUser);
      setLastFetch(now);
      
      // Если пользователь только что авторизовался (был null, стал объект) - сливаем корзины
      // Но только если это не было сделано в login route
      // Проверяем наличие cookie корзины - если она есть, значит слияние еще не произошло
      if (wasNotAuthenticated && newUser !== null) {
        try {
          // Небольшая задержка, чтобы убедиться, что cookie обновились после логина
          await new Promise(resolve => setTimeout(resolve, 200));
          console.log('[AuthContext] Пытаемся выполнить слияние корзин после авторизации');
          const mergeResponse = await axios.post('/api/cart/merge');
          console.log('[AuthContext] Корзины успешно объединены:', mergeResponse.data);
        } catch (error: any) {
          // Игнорируем ошибки слияния корзин, чтобы не блокировать авторизацию
          // Возможно, слияние уже произошло в login route (cookie уже удалена)
          console.log('[AuthContext] Слияние корзин (возможно уже выполнено в login route):', error?.response?.data?.message || error?.message);
        }
      }
    } catch (error: any) {
      // 401 - это нормально для неавторизованных пользователей, не логируем как ошибку
      if (error?.response?.status !== 401) {
        console.error('Ошибка загрузки пользователя:', error);
      }
      setUser(null);
      setLastFetch(now);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    await fetchUser(true);
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      setLastFetch(0);
      // Перенаправляем на главную страницу после выхода
      window.location.href = '/';
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        refreshAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

