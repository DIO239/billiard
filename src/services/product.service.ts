import { prisma } from './prisma';

export class ProductService {
  static async list(params?: { skip?: number; take?: number; search?: string; typeId?: number }) {
    const { skip = 0, take = 20, search, typeId } = params || {};
    return prisma.product.findMany({
      where: {
        AND: [
          search ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] } : {},
          typeId ? { typeId } : {},
        ],
      },
      include: { media: true, characteristic: true, type: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: number) {
    return prisma.product.findUnique({ where: { id }, include: { media: true, characteristic: true, type: true } });
  }

  static async create(data: {
    title: string;
    description: string;
    price: number;
    count: number;
    visible: boolean;
    typeId: number;
  }) {
    return prisma.product.create({ data });
  }

  static async update(id: number, data: Partial<{ title: string; description: string; price: number; count: number; visible: boolean; typeId: number }>) {
    return prisma.product.update({ where: { id }, data });
  }

  static async remove(id: number) {
    return prisma.product.delete({ where: { id } });
  }
}
