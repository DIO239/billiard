import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed типов товаров
  const cueType = await prisma.type.upsert({
    where: { value: 'cues' },
    update: {},
    create: { value: 'cues', name: 'Кии' },
  });
  const tableType = await prisma.type.upsert({
    where: { value: 'tables' },
    update: {},
    create: { value: 'tables', name: 'Столы' },
  });

  // Seed администратора
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.ADMIN, password: passwordHash, verified: new Date() },
    create: { fullName: 'Admin', email: adminEmail, password: passwordHash, role: UserRole.ADMIN, verified: new Date() },
  });

  // Seed пары товаров (если отсутствуют)
  const existingCue = await prisma.product.findFirst({ where: { title: 'Кий стандарт' } });
  if (!existingCue) {
    await prisma.product.create({
      data: {
        title: 'Кий стандарт',
        description: 'Базовый кий для начинающих',
        price: 4990,
        count: 50,
        visible: true,
        typeId: cueType.id,
      },
    });
  }

  const existingTable = await prisma.product.findFirst({ where: { title: 'Стол 9 футов' } });
  if (!existingTable) {
    await prisma.product.create({
      data: {
        title: 'Стол 9 футов',
        description: 'Профессиональный бильярдный стол 9ft',
        price: 199990,
        count: 5,
        visible: true,
        typeId: tableType.id,
      },
    });
  }
}

main()
  .then(async () => {
    console.log('Prisma seed completed');
  })
  .catch(async (e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


