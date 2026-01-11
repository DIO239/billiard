import { TypeService } from '@/services/type.service';
import { typeCreateSchema } from '@/validation/type';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { validate } from '@/app/api/_utils/validate';
import { addCorsHeaders, handleOptionsRequest } from '@/app/api/_utils/cors';

export async function GET(req: Request) {
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(req);
  }
  
  const items = await TypeService.list();
  const response = new Response(JSON.stringify(items), { status: 200 });
  return addCorsHeaders(response, req);
}

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  const data = validate(typeCreateSchema, body);
  const created = await TypeService.create(data);
  return new Response(JSON.stringify(created), { status: 201 });
});
