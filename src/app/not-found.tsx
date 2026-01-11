'use client';

import { useLayoutEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  // Используем useLayoutEffect для синхронной установки флага ДО первого рендера
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.setAttribute('data-not-found', 'true');
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.removeAttribute('data-not-found');
      }
    };
  }, []);
  
  // Дополнительная синхронная установка на случай, если useLayoutEffect не сработал
  if (typeof window !== 'undefined') {
    document.body.setAttribute('data-not-found', 'true');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen -mx-16 -mt-40 -mb-20">
      <h1 className="text-4xl font-bold mb-4">Страница не найдена</h1>
      <p className="text-gray-600 mb-8">Запрашиваемая страница не существует</p>
      <Link href="/">
        <Button>Перейти на главную</Button>
      </Link>
    </div>
  );
}
