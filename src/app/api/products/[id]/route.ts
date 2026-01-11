import { ProductService } from '@/services/product.service';
import { productUpdateSchema } from '@/validation/product';
import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { validate } from '@/app/api/_utils/validate';
import { addCorsHeaders, handleOptionsRequest } from '@/app/api/_utils/cors';

export async function OPTIONS(req: Request) {
  return handleOptionsRequest(req);
}

export const GET = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const id = Number(params.id);
  
  // Проверяем, что ID является валидным числом
  if (Number.isNaN(id) || !Number.isFinite(id) || id <= 0) {
    throw { status: 400, message: 'Некорректный id' };
  }
  
  // Проверяем, что ID не слишком большой (защита от переполнения)
  if (id > Number.MAX_SAFE_INTEGER) {
    throw { status: 400, message: 'Некорректный id' };
  }
  
  try {
    const item = await ProductService.getById(id);
    if (!item) {
      throw { status: 404, message: 'Продукт не найден' };
    }
    
    return new Response(JSON.stringify(item), { status: 200 });
  } catch (error: any) {
    // Если это уже обработанная ошибка с status, пробрасываем её дальше
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }
    // Иначе логируем и возвращаем 404 (скорее всего продукт не найден)
    console.error('Ошибка при получении продукта:', error);
    throw { status: 404, message: 'Продукт не найден' };
  }
});

export const PATCH = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  isAdmin(req);
  const id = Number(params.id);
  if (Number.isNaN(id)) throw { status: 400, message: 'Некорректный id' };
  const body = await req.json();
  const data = validate(productUpdateSchema, body);
  const updated = await ProductService.update(id, data);
  return new Response(JSON.stringify(updated), { status: 200 });
});

export const DELETE = errorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  isAdmin(req);
  const id = Number(params.id);
  if (Number.isNaN(id)) throw { status: 400, message: 'Некорректный id' };
  
  // Получаем медиа продукта перед удалением
  const { MediaService } = await import('@/services/media.service');
  const mediaToDelete = await MediaService.list(id);
  
  // Удаляем файлы локально
  if (mediaToDelete.length > 0) {
    const { unlink } = await import('fs/promises');
    const { join } = await import('path');
    const { existsSync } = await import('fs');
    
    const deletions: Array<Promise<any>> = [];
    for (const media of mediaToDelete) {
      if (media.name) {
        // Преобразуем URL в путь к файлу
        // /static/products/123/file.jpg -> public/static/products/123/file.jpg
        const normalizedPath = media.name.startsWith('/') ? media.name.substring(1) : media.name;
        const filePath = join(process.cwd(), 'public', normalizedPath);
        if (existsSync(filePath)) {
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
        } else {
          console.warn(`Файл не найден: ${filePath}`);
        }
      }
    }
    await Promise.allSettled(deletions);
  }
  
  // Удаляем продукт (медиа удалятся каскадно из БД)
  await ProductService.remove(id);
  return new Response(null, { status: 204 });
});
