import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { MediaService } from '@/services/media.service';

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const productId = formData.get('productId') as string;
  
  if (!file) {
    throw { status: 400, message: 'Файл не найден' };
  }
  
  if (!productId) {
    throw { status: 400, message: 'productId обязателен' };
  }

  // Определяем тип файла
  const isVideo = file.type.startsWith('video/');
  const fileType = isVideo ? 'video' : 'image';
  
  // Создаем уникальное имя файла
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
  const fileName = `${timestamp}-${randomString}.${fileExtension}`;
  
  // Путь для сохранения: public/static/products/{productId}/{fileName}
  const staticDir = join(process.cwd(), 'public', 'static', 'products', productId);
  const filePath = join(staticDir, fileName);
  
  // Создаем директорию если её нет
  if (!existsSync(staticDir)) {
    await mkdir(staticDir, { recursive: true });
  }
  
  // Конвертируем File в Buffer и сохраняем
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);
  
  // URL для доступа к файлу
  const fileUrl = `/static/products/${productId}/${fileName}`;
  
  // Сохраняем информацию о медиа в БД
  const mediaData = {
    productId: Number(productId),
    type: fileType,
    name: fileUrl,
    publicId: null, // Больше не используется
  };
  
  const created = await MediaService.create(mediaData);
  
  return new Response(JSON.stringify({
    id: created.id,
    secure_url: fileUrl,
    resource_type: fileType,
    public_id: null,
  }), { status: 201 });
});

