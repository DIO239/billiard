import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { MediaService } from '@/services/media.service';

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  const toRecord = (item: any) => {
    const { productId, secure_url, resource_type, public_id } = item || {};
    if (!productId || !secure_url) return null;
    const logicalType = resource_type === 'video' ? 'video' : 'image';
    return { productId, type: logicalType, name: secure_url, publicId: public_id ?? null } as const;
  };
  if (Array.isArray(body)) {
    const items = body.map(toRecord).filter(Boolean) as Array<{ productId: number; type: string; name: string; publicId?: string | null }>;
    if (items.length === 0) throw { status: 400, message: 'Пустой или некорректный массив' };
    const result = await MediaService.createMany(items);
    return new Response(JSON.stringify({ count: (result as any).count ?? items.length }), { status: 201 });
  }
  const single = toRecord(body);
  if (!single) throw { status: 400, message: 'productId и secure_url обязательны' };
  const created = await MediaService.create(single);
  return new Response(JSON.stringify(created), { status: 201 });
});
