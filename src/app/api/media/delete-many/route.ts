import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { MediaService } from '@/services/media.service';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  if (!Array.isArray(body) || body.length === 0) {
    throw { status: 400, message: 'Ожидается непустой массив' };
  }
  
  const ids: number[] = [];
  const filePaths: string[] = [];
  
  // Собираем ID медиа для удаления из БД и пути к файлам
  for (const item of body) {
    if (typeof item?.id === 'number') {
      ids.push(item.id);
      // Получаем информацию о медиа для удаления файла
      const media = await MediaService.getById(item.id);
      if (media && media.name) {
        // Преобразуем URL в путь к файлу
        // /static/products/123/file.jpg -> public/static/products/123/file.jpg
        const normalizedPath = media.name.startsWith('/') ? media.name.substring(1) : media.name;
        const filePath = join(process.cwd(), 'public', normalizedPath);
        if (existsSync(filePath)) {
          filePaths.push(filePath);
        } else {
          console.warn(`Файл не найден: ${filePath}`);
        }
      }
    }
  }
  
  // Удаляем файлы локально
  const deletions: Array<Promise<any>> = [];
  for (const filePath of filePaths) {
    deletions.push(
      unlink(filePath)
        .then(() => {
          console.log(`Файл успешно удален: ${filePath}`);
        })
        .catch((err) => {
          console.error(`Ошибка удаления файла ${filePath}:`, err);
          // Продолжаем даже если файл не найден
        })
    );
  }
  await Promise.allSettled(deletions);
  
  // Удаляем записи из БД
  let count = 0;
  if (ids.length) {
    count += (await MediaService.removeManyByIds(ids)).count || 0;
  }
  
  return new Response(JSON.stringify({ count }), { status: 200 });
});
