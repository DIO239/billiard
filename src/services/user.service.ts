import { prisma } from './prisma';

export class UserService {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, include: { verificationCode: true } });
  }

  static async createUser(data: { fullName: string; email: string; password: string; code: string }) {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        verificationCode: {
          create: { code: data.code },
        },
      },
      include: { verificationCode: true },
    });
  }

  static async verifyUser(email: string, code: string) {
    const user = await prisma.user.findUnique({ where: { email }, include: { verificationCode: true } });
    if (!user || !user.verificationCode || user.verificationCode.code !== code) return null;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: new Date(),
        verificationCode: { delete: true },
      },
    });
    return true;
  }
}
