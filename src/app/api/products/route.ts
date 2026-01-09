import { ProductService } from '@/services/product.service';
import { productCreateSchema } from '@/validation/product';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { validate } from '@/app/api/_utils/validate';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skip = Number(searchParams.get('skip') || 0);
  const take = Number(searchParams.get('take') || 20);
  // Явно проверяем наличие параметра search - если его нет, не передаем в сервис
  const searchParam = searchParams.get('search');
  const search = searchParam && searchParam.trim() !== '' ? searchParam : undefined;
  const typeId = searchParams.get('typeId') ? Number(searchParams.get('typeId')) : undefined;

  // Если search не передан явно, не используем его для фильтрации основного списка
  const products = await ProductService.list({ skip, take, search, typeId });
  return new Response(JSON.stringify({ products }), { status: 200 });
}

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  const data = validate(productCreateSchema, body);
  const created = await ProductService.create(data);
  return new Response(JSON.stringify(created), { status: 201 });
});
