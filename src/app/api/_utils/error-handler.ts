import { addCorsHeaders, handleOptionsRequest } from './cors';

const errorHandler = (fn: (...args: any[]) => Promise<any>) =>
  async (...args: any[]) => {
    const req = args[0] as Request;
    
    // Обработка preflight запросов (OPTIONS)
    if (req.method === 'OPTIONS') {
      return handleOptionsRequest(req);
    }
    
    try {
      const response = await fn(...args);
      return addCorsHeaders(response, req);
    } catch (error: any) {
      // Если ошибка — объект с числовым полем status, возвращаем этот статус
      if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
        const errorResponse = new Response(JSON.stringify({ error: error.message }), { status: error.status });
        return addCorsHeaders(errorResponse, req);
      }
      // Иначе — стандартная обработка
      const errorResponse = new Response(JSON.stringify({ error: error?.message || 'Internal Server Error' }), { status: 500 });
      return addCorsHeaders(errorResponse, req);
    }
  };

export default errorHandler;
