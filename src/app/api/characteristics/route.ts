import { CharacteristicService } from '@/services/characteristic.service';
import { characteristicCreateSchema } from '@/validation/characteristic';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { validate } from '@/app/api/_utils/validate';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId') ? Number(searchParams.get('productId')) : undefined;
  const items = await CharacteristicService.list(productId);
  return new Response(JSON.stringify(items), { status: 200 });
}

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  const data = validate(characteristicCreateSchema, body);
  const created = await CharacteristicService.create(data);
  return new Response(JSON.stringify(created), { status: 201 });
});
