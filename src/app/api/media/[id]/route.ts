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
  
  // Проверяем существование медиа
  const existingMedia = await MediaService.getById(id);
  if (!existingMedia) throw { status: 404, message: 'Медиа не найдено' };
  
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
    // /static/products/123/file.jpg -> public/static/products/123/file.jpg
    const normalizedPath = media.name.startsWith('/') ? media.name.substring(1) : media.name;
    const filePath = join(process.cwd(), 'public', normalizedPath);
    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
        console.log(`Файл успешно удален: ${filePath}`);
      } catch (error) {
        console.error(`Ошибка удаления файла ${filePath}:`, error);
        // Продолжаем удаление из БД даже если файл не найден
      }
    } else {
      console.warn(`Файл не найден: ${filePath}`);
    }
  }
  
  // Удаляем запись из БД
  await MediaService.remove(id);
  return new Response(null, { status: 204 });
});
