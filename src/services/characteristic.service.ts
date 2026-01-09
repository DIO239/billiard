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
    attributes?: Record<string, string | number> | null;
  }) {
    try {
      const createData: any = {
        productId: data.productId,
      };
      
      if (data.attributes && Object.keys(data.attributes).length > 0) {
        createData.attributes = data.attributes;
      } else {
        createData.attributes = null;
      }
      
      return await prisma.characteristic.create({ 
        data: createData
      });
    } catch (error: any) {
      console.error('Ошибка в CharacteristicService.create:', error);
      throw error;
    }
  }

  static async update(id: number, data: Partial<{ attributes: Record<string, string | number> | null }>) {
    const updateData: any = {};
    if (data.attributes !== undefined) {
      updateData.attributes = data.attributes || null;
    }
    return prisma.characteristic.update({ 
      where: { id }, 
      data: updateData
    });
  }

  static async remove(id: number) {
    return prisma.characteristic.delete({ where: { id } });
  }
}
