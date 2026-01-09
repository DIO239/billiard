import { MediaService } from '@/services/media.service';
import { mediaUpdateSchema } from '@/validation/media';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { validate } from '@/app/api/_utils/validate';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return new Response(JSON.stringify({ error: 'Некорректный id' }), { status: 400 });
  const item = await MediaService.getById(id);
  if (!item) return new Response(JSON.stringify({ error: 'Не найдено' }), { status: 404 });
  return new Response(JSON.stringify(item), { status: 200 });
}

export const PATCH = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  isAdmin(req);
  const id = Number(params.id);
  if (Number.isNaN(id)) throw { status: 400, message: 'Некорректный id' };
  const body = await req.json();
  const data = validate(mediaUpdateSchema, body);
  const updated = await MediaService.update(id, data);
  return new Response(JSON.stringify(updated), { status: 200 });
});

export const DELETE = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  isAdmin(req);
  const id = Number(params.id);
  if (Number.isNaN(id)) throw { status: 400, message: 'Некорректный id' };
  
  // Получаем информацию о медиа перед удалением
  const media = await MediaService.getById(id);
  if (!media) throw { status: 404, message: 'Медиа не найдено' };
  
  // Удаляем файл локально, если он существует
  if (media.name) {
    const { unlink } = await import('fs/promises');
    const { join } = await import('path');
    const { existsSync } = await import('fs');
    
    // Преобразуем URL в путь к файлу
    const filePath = join(process.cwd(), 'public', media.name);
    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`Ошибка удаления файла ${filePath}:`, error);
        // Продолжаем удаление из БД даже если файл не найден
      }
    }
  }
  
  // Удаляем запись из БД
  await MediaService.remove(id);
  return new Response(null, { status: 204 });
});
