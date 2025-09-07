import { TypeService } from '@/services/type.service';
import { typeCreateSchema } from '@/validation/type';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { validate } from '@/app/api/_utils/validate';

export async function GET() {
  const items = await TypeService.list();
  return new Response(JSON.stringify(items), { status: 200 });
}

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  const data = validate(typeCreateSchema, body);
  const created = await TypeService.create(data);
  return new Response(JSON.stringify(created), { status: 201 });
});
