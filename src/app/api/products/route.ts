import { ProductService } from '@/services/product.service';
import { productCreateSchema } from '@/validation/product';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { validate } from '@/app/api/_utils/validate';
import { addCorsHeaders, handleOptionsRequest } from '@/app/api/_utils/cors';

export async function GET(req: Request) {
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(req);
  }
  
  const { searchParams } = new URL(req.url);
  const all = searchParams.get('all') === 'true';
  const skip = all ? undefined : Number(searchParams.get('skip') || 0);
  const take = all ? undefined : Number(searchParams.get('take') || 20);
  // Явно проверяем наличие параметра search - если его нет, не передаем в сервис
  const searchParam = searchParams.get('search');
  const search = searchParam && searchParam.trim() !== '' ? searchParam : undefined;
  const typeId = searchParams.get('typeId') ? Number(searchParams.get('typeId')) : undefined;
  const priceMin = searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined;
  const priceMax = searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined;
  const visibleParam = searchParams.get('visible');
  // Если all=true, передаем visible: null для загрузки всех товаров (включая скрытые)
  // Если visible не указан, используем undefined (будет применено значение по умолчанию true)
  // Если visible указан явно (true/false), используем его
  const visible = all ? null : (visibleParam === null ? undefined : visibleParam === 'true');
  const sortBy = searchParams.get('sortBy') as 'title' | 'price' | undefined;
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

  // Если search не передан явно, не используем его для фильтрации основного списка
  const products = await ProductService.list({ skip, take, search, typeId, priceMin, priceMax, visible, sortBy, sortOrder });
  const response = new Response(JSON.stringify({ products }), { status: 200 });
  return addCorsHeaders(response, req);
}

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  const data = validate(productCreateSchema, body);
  const created = await ProductService.create(data);
  return new Response(JSON.stringify(created), { status: 201 });
});
