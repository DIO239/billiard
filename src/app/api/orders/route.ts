import errorHandler from '@/app/api/_utils/error-handler';
import { validate } from '../_utils/validate';
import { OrderService } from '@/services/order.service';
import { orderSchema } from '@/validation/order';

export const GET = errorHandler(async (req: Request) => {
  const orders = await OrderService.getAll();
  return new Response(JSON.stringify(orders), { status: 200 });
});

export const POST = errorHandler(async (req: Request) => {
  const body = await req.json();
  const data = validate(orderSchema, body);
  const order = await OrderService.create(data);
  return new Response(JSON.stringify(order), { status: 201 });
});
