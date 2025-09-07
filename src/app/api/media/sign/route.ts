import { isAdmin } from '@/app/api/_middleware/is-admin';
import errorHandler from "@/app/api/_utils/error-handler"
import { cld } from '@/services/cloudinary';

export const POST = errorHandler(async (req: Request) => {
  isAdmin(req);
  const { productId, kind, folder = 'products' } = await req.json();
  if (!productId) throw { status: 400, message: 'productId обязателен' };
  if (kind !== 'image' && kind !== 'video') {
    throw { status: 400, message: "kind должен быть 'image' или 'video'" };
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
  const fullFolder = `${folder}/${productId}`;
  const allowed_formats = kind === 'image'
    ? ['jpg', 'jpeg', 'png', 'webp', 'gif']
    : ['mp4', 'mov', 'webm'];
  const max_file_size = kind === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
  const paramsToSign: Record<string, any> = {
    folder: fullFolder,
    timestamp,
    resource_type: kind,
    allowed_formats,
    max_file_size,
  };
  if (upload_preset) paramsToSign.upload_preset = upload_preset;
  const signature = cld.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);
  return new Response(
    JSON.stringify({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder: fullFolder,
      resourceType: kind,
      allowedFormats: allowed_formats,
      maxFileSize: max_file_size,
      uploadPreset: upload_preset || null,
    }),
    { status: 200 }
  );
});
