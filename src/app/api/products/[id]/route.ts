import { ProductService } from '@/services/product.service';
import { productUpdateSchema } from '@/validation/product';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { validate } from '@/app/api/_utils/validate';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return new Response(JSON.stringify({ error: 'Некорректный id' }), { status: 400 });
  const item = await ProductService.getById(id);
  if (!item) return new Response(JSON.stringify({ error: 'Не найдено' }), { status: 404 });
  return new Response(JSON.stringify(item), { status: 200 });
}

export const PATCH = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  isAdmin(req);
  const id = Number(params.id);
  if (Number.isNaN(id)) throw { status: 400, message: 'Некорректный id' };
  const body = await req.json();
  const data = validate(productUpdateSchema, body);
  const updated = await ProductService.update(id, data);
  return new Response(JSON.stringify(updated), { status: 200 });
});

export const DELETE = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  isAdmin(req);
  const id = Number(params.id);
  if (Number.isNaN(id)) throw { status: 400, message: 'Некорректный id' };
  await ProductService.remove(id);
  return new Response(null, { status: 204 });
});
