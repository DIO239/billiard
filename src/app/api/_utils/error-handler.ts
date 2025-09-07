  const errorHandler = (fn: (...args: any[]) => Promise<any>) =>
    async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error: any) {
        // Если ошибка — объект с числовым полем status, возвращаем этот статус
        if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
          return new Response(JSON.stringify({ error: error.message }), { status: error.status });
        }
        // Иначе — стандартная обработка
        return new Response(JSON.stringify({ error: error?.message || 'Internal Server Error' }), { status: 500 });
      }
    };

  export default errorHandler;
