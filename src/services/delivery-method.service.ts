import { prisma } from './prisma';
import { DeliveryMethodCreateInput, DeliveryMethodUpdateInput } from '@/validation/delivery-method';

export class DeliveryMethodService {
  static async list() {
    return prisma.deliveryMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: number) {
    return prisma.deliveryMethod.findUnique({ where: { id } });
  }

  static async create(data: DeliveryMethodCreateInput) {
    return prisma.deliveryMethod.create({ data });
  }

  static async update(id: number, data: DeliveryMethodUpdateInput) {
    return prisma.deliveryMethod.update({
      where: { id },
      data,
    });
  }

  static async remove(id: number) {
    return prisma.deliveryMethod.delete({ where: { id } });
  }
}
