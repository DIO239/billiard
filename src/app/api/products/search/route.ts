import { ProductService } from '@/services/product.service';
import errorHandler from '@/app/api/_utils/error-handler';

/**
 * Отдельный endpoint для поиска товаров
 * Не влияет на основной список товаров в Main
 */
export const GET = errorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const typeId = searchParams.get('typeId') ? Number(searchParams.get('typeId')) : undefined;
  const limit = Number(searchParams.get('limit') || 10); // Ограничиваем количество результатов поиска

  if (!search) {
    return new Response(JSON.stringify({ products: [] }), { status: 200 });
  }

  const products = await ProductService.list({ 
    skip: 0, 
    take: limit, 
    search, 
    typeId 
  });
  
  return new Response(JSON.stringify({ products }), { status: 200 });
});
