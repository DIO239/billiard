import { MediaService } from '@/services/media.service';
import { mediaCreateSchema } from '@/validation/media';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { validate } from '@/app/api/_utils/validate';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId') ? Number(searchParams.get('productId')) : undefined;
  const items = await MediaService.list(productId);
  return new Response(JSON.stringify(items), { status: 200 });
}

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  const data = validate(mediaCreateSchema, body);
  const created = await MediaService.create(data);
  return new Response(JSON.stringify(created), { status: 201 });
});
