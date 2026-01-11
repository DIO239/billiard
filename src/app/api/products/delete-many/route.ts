import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { ProductService } from '@/services/product.service';
import { MediaService } from '@/services/media.service';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const body = await req.json();
  
  if (!Array.isArray(body) || body.length === 0) {
    throw { status: 400, message: 'Ожидается непустой массив ID товаров' };
  }
  
  // Валидация: все элементы должны быть числами
  const ids: number[] = [];
  for (const id of body) {
    const numId = typeof id === 'number' ? id : Number(id);
    if (Number.isNaN(numId) || !Number.isFinite(numId) || numId <= 0) {
      throw { status: 400, message: 'Некорректный ID товара' };
    }
    ids.push(numId);
  }
  
  // Получаем все медиа, связанные с этими продуктами, перед удалением
  const mediaToDelete = await MediaService.listByProductIds(ids);
  
  // Собираем пути к файлам для удаления
  const filePaths: string[] = [];
  for (const media of mediaToDelete) {
    if (media.name) {
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
  
  // Удаляем товары (медиа удалятся каскадно из БД)
  const result = await ProductService.removeMany(ids);
  
  return new Response(JSON.stringify({ count: result.count }), { status: 200 });
});
