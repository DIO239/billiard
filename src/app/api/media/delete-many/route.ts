import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { MediaService } from '@/services/media.service';
import { cld } from '@/services/cloudinary';

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  if (!Array.isArray(body) || body.length === 0) {
    throw { status: 400, message: 'Ожидается непустой массив' };
  }
  const publicIds: string[] = [];
  const ids: number[] = [];
  for (const item of body) {
    if (item?.publicId) publicIds.push(item.publicId);
    if (typeof item?.id === 'number') ids.push(item.id);
  }
  const deletions: Array<Promise<any>> = [];
  for (const pid of publicIds) {
    deletions.push(cld.uploader.destroy(pid, { invalidate: true }));
  }
  await Promise.allSettled(deletions);
  let count = 0;
  if (ids.length) count += (await MediaService.removeManyByIds(ids)).count || 0;
  if (publicIds.length) count += (await MediaService.removeManyByPublicIds(publicIds)).count || 0;
  return new Response(JSON.stringify({ count }), { status: 200 });
});
