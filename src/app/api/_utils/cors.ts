// Утилита для добавления CORS заголовков к ответам

export function addCorsHeaders(response: Response, req: Request): Response {
  const origin = req.headers.get('origin');
  // Разрешаем запросы с любого origin (можно ограничить конкретными доменами через переменную окружения)
  const allowedOrigin = process.env.ALLOWED_ORIGINS 
    ? (origin && process.env.ALLOWED_ORIGINS.split(',').includes(origin) ? origin : null)
    : (origin || '*');
  
  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 часа
  
  return response;
}

// Обработка preflight запросов (OPTIONS)
export function handleOptionsRequest(req: Request): Response {
  const response = new Response(null, { status: 204 });
  return addCorsHeaders(response, req);
}
