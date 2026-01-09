import { DeliveryMethodService } from '@/services/delivery-method.service';
import { deliveryMethodUpdateSchema } from '@/validation/delivery-method';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from '@/app/api/_utils/error-handler';
import { validate } from '@/app/api/_utils/validate';

export const GET = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw { status: 400, message: 'Неверный ID' };
  }
  const method = await DeliveryMethodService.getById(id);
  if (!method) {
    throw { status: 404, message: 'Способ доставки не найден' };
  }
  return new Response(JSON.stringify(method), { status: 200 });
});

export const PATCH = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  isAdmin(req);
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw { status: 400, message: 'Неверный ID' };
  }
  const body = await req.json();
  const data = validate(deliveryMethodUpdateSchema, body);
  const updated = await DeliveryMethodService.update(id, data);
  return new Response(JSON.stringify(updated), { status: 200 });
});

export const DELETE = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  isAdmin(req);
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw { status: 400, message: 'Неверный ID' };
  }
  await DeliveryMethodService.remove(id);
  return new Response(JSON.stringify({ message: 'Способ доставки удален' }), { status: 200 });
});
