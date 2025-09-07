import { prisma } from './prisma';

export class MediaService {
  static async list(productId?: number) {
    return prisma.media.findMany({
      where: productId ? { productId } : undefined,
      orderBy: { id: 'desc' },
    });
  }

  static async getById(id: number) {
    return prisma.media.findUnique({ where: { id } });
  }

  static async create(data: { productId: number; type: string; name: string; publicId?: string | null }) {
    return prisma.media.create({ data });
  }

  static async createMany(items: Array<{ productId: number; type: string; name: string; publicId?: string | null }>) {
    if (!items || items.length === 0) return { count: 0 };
    return prisma.media.createMany({ data: items });
  }

  static async setPublicId(id: number, publicId: string) {
    return prisma.media.update({ where: { id }, data: { publicId } });
  }

  static async update(id: number, data: Partial<{ type: string; name: string; publicId: string | null }>) {
    return prisma.media.update({ where: { id }, data });
  }

  static async remove(id: number) {
    return prisma.media.delete({ where: { id } });
  }

  static async removeManyByIds(ids: number[]) {
    if (!ids?.length) return { count: 0 };
    const res = await prisma.media.deleteMany({ where: { id: { in: ids } } });
    return res;
  }

  static async removeManyByPublicIds(publicIds: string[]) {
    if (!publicIds?.length) return { count: 0 };
    const res = await prisma.media.deleteMany({ where: { publicId: { in: publicIds } } });
    return res;
  }
}
