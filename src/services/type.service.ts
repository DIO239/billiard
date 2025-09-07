import { prisma } from './prisma';

export class TypeService {
  static async list() {
    return prisma.type.findMany({ orderBy: { name: 'asc' } });
  }

  static async getById(id: number) {
    return prisma.type.findUnique({ where: { id } });
  }

  static async create(data: { value: string; name: string }) {
    return prisma.type.create({ data });
  }

  static async update(id: number, data: Partial<{ value: string; name: string }>) {
    return prisma.type.update({ where: { id }, data });
  }

  static async remove(id: number) {
    return prisma.type.delete({ where: { id } });
  }
}
