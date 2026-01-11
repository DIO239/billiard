'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

// Динамический импорт SwaggerUI для избежания SSR проблем
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Загрузка документации...</div></div>
});

import { swaggerSpec } from '@/lib/swagger';

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);
  const consoleErrorRef = useRef<typeof console.error | null>(null);
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  // Проверка прав доступа - только для администраторов
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      notFound();
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  useEffect(() => {
    // Загружаем Swagger UI только если пользователь имеет права доступа
    if (isAuthenticated && isAdmin) {
      setMounted(true);
      // Динамический импорт CSS для Swagger UI
      import('swagger-ui-react/swagger-ui.css').catch(() => {
        console.warn('Не удалось загрузить CSS для Swagger UI');
      });

      // Подавляем предупреждения о UNSAFE методах жизненного цикла от swagger-ui-react
      const originalError = console.error;
      consoleErrorRef.current = originalError;
      
      console.error = (...args: any[]) => {
        // Фильтруем предупреждения о UNSAFE_componentWillReceiveProps от swagger-ui-react
        if (
          typeof args[0] === 'string' &&
          (args[0].includes('UNSAFE_componentWillReceiveProps') ||
           args[0].includes('ModelCollapse') ||
           args[0].includes('unsafe-component-lifecycles'))
        ) {
          return; // Игнорируем эти предупреждения
        }
        originalError.apply(console, args);
      };

      return () => {
        // Восстанавливаем оригинальный console.error при размонтировании
        if (consoleErrorRef.current) {
          console.error = consoleErrorRef.current;
        }
      };
    }
  }, [isAuthenticated, isAdmin]);

  // Показываем загрузку пока проверяем права доступа
  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка документации...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">API Документация</h1>
        <p className="text-gray-600 mb-8">
          Полная документация API для интернет-магазина бильярдного оборудования.
          Используйте кнопку &quot;Authorize&quot; для добавления JWT токена.
        </p>
        <SwaggerUI spec={swaggerSpec} />
      </div>
    </div>
  );
}
