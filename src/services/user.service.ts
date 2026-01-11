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

  static async createAdminUser(data: { fullName: string; email: string; password: string; role?: 'USER' | 'ADMIN' }) {
    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role || 'USER',
        verified: new Date(), // Сразу подтверждаем при создании админом
      },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
          take: 1,
        },
      },
    });

    // Заполняем provider и providerId из Account
    const account = user.accounts[0];
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      verified: user.verified,
      provider: account?.provider || null,
      providerId: account?.providerAccountId || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
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

  static async setResetToken(userId: number, token: string, expires: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });
  }

  static async findByResetToken(token: string) {
    return prisma.user.findFirst({
      where: { resetToken: token },
    });
  }

  static async updatePasswordAndClearToken(userId: number, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });
  }

  static async list() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
          take: 1, // Берем только первый провайдер
        },
      },
    });

    // Заполняем provider и providerId из Account
    return users.map(user => {
      const account = user.accounts[0];
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        verified: user.verified,
        provider: account?.provider || null,
        providerId: account?.providerAccountId || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });
  }

  static async getById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
          take: 1, // Берем только первый провайдер
        },
      },
    });

    if (!user) return null;

    // Заполняем provider и providerId из Account
    const account = user.accounts[0];
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      verified: user.verified,
      provider: account?.provider || null,
      providerId: account?.providerAccountId || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async update(id: number, data: { fullName?: string; email?: string; role?: 'USER' | 'ADMIN' }) {
    const user = await prisma.user.update({
      where: { id },
      data,
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
          take: 1, // Берем только первый провайдер
        },
      },
    });

    // Заполняем provider и providerId из Account
    const account = user.accounts[0];
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      verified: user.verified,
      provider: account?.provider || null,
      providerId: account?.providerAccountId || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async delete(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }
}
