import errorHandler from '@/app/api/_utils/error-handler';
import { validate } from '../../_utils/validate';
import { OrderService } from '@/services/order.service';
import { orderSchema } from '@/validation/order';

export const GET = errorHandler(async (req: Request, { params }: any) => {
  const order = await OrderService.getById(Number(params.id));
  if (!order) throw { status: 404, message: 'Order not found' };
  return new Response(JSON.stringify(order), { status: 200 });
});

export const PATCH = errorHandler(async (req: Request, { params }: any) => {
  const body = await req.json();
  const data = validate(orderSchema, body);
  const order = await OrderService.update(Number(params.id), data);
  return new Response(JSON.stringify(order), { status: 200 });
});

export const DELETE = errorHandler(async (req: Request, { params }: any) => {
  await OrderService.delete(Number(params.id));
  return new Response(null, { status: 204 });
});
