import { prisma } from './prisma';

export class CharacteristicService {
  static async list(productId?: number) {
    return prisma.characteristic.findMany({
      where: productId ? { productId } : undefined,
      orderBy: { id: 'desc' },
    });
  }

  static async getById(id: number) {
    return prisma.characteristic.findUnique({ where: { id } });
  }

  static async create(data: {
    productId: number;
    height?: number | null;
    weight?: number | null;
    material?: string | null;
    wood?: string | null;
    master?: string | null;
    country?: string | null;
    parts?: string | null;
  }) {
    return prisma.characteristic.create({ data });
  }

  static async update(id: number, data: Partial<{ height: number | null; weight: number | null; material: string | null; wood: string | null; master: string | null; country: string | null; parts: string | null }>) {
    return prisma.characteristic.update({ where: { id }, data });
  }

  static async remove(id: number) {
    return prisma.characteristic.delete({ where: { id } });
  }
}
