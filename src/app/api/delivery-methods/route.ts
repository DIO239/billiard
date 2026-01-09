import { DeliveryMethodService } from '@/services/delivery-method.service';
import { deliveryMethodCreateSchema } from '@/validation/delivery-method';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from '@/app/api/_utils/error-handler';
import { validate } from '@/app/api/_utils/validate';

export const GET = errorHandler(async (req: Request) => {
  const methods = await DeliveryMethodService.list();
  return new Response(JSON.stringify(methods), { status: 200 });
});

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  const data = validate(deliveryMethodCreateSchema, body);
  const created = await DeliveryMethodService.create(data);
  return new Response(JSON.stringify(created), { status: 201 });
});
