import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало seeding...');

  // Seed типов товаров с characteristicFields
  const cueType = await prisma.type.upsert({
    where: { value: 'cues' },
    update: {
      characteristicFields: [
        { key: 'length', label: 'Длина', type: 'number', placeholder: 'Длина в см' },
        { key: 'weight', label: 'Вес', type: 'number', placeholder: 'Вес в граммах' },
        { key: 'material', label: 'Материал', type: 'string', placeholder: 'Материал наклейки' },
        { key: 'wood', label: 'Древесина', type: 'string', placeholder: 'Тип древесины' },
        { key: 'master', label: 'Мастер', type: 'string', placeholder: 'Имя мастера' },
        { key: 'country', label: 'Страна', type: 'string', placeholder: 'Страна производства' },
      ],
    },
    create: {
      value: 'cues',
      name: 'Бильярдный кий',
      characteristicFields: [
        { key: 'length', label: 'Длина', type: 'number', placeholder: 'Длина в см' },
        { key: 'weight', label: 'Вес', type: 'number', placeholder: 'Вес в граммах' },
        { key: 'material', label: 'Материал', type: 'string', placeholder: 'Материал наклейки' },
        { key: 'wood', label: 'Древесина', type: 'string', placeholder: 'Тип древесины' },
        { key: 'master', label: 'Мастер', type: 'string', placeholder: 'Имя мастера' },
        { key: 'country', label: 'Страна', type: 'string', placeholder: 'Страна производства' },
      ],
    },
  });

  const tableType = await prisma.type.upsert({
    where: { value: 'tables' },
    update: {
      characteristicFields: [
        { key: 'size', label: 'Размер', type: 'string', placeholder: 'Размер стола (7ft, 8ft, 9ft)' },
        { key: 'cloth', label: 'Сукно', type: 'string', placeholder: 'Тип сукна' },
        { key: 'pockets', label: 'Лузы', type: 'string', placeholder: 'Тип луз' },
        { key: 'frame', label: 'Рама', type: 'string', placeholder: 'Материал рамы' },
      ],
    },
    create: {
      value: 'tables',
      name: 'Стол',
      characteristicFields: [
        { key: 'size', label: 'Размер', type: 'string', placeholder: 'Размер стола (7ft, 8ft, 9ft)' },
        { key: 'cloth', label: 'Сукно', type: 'string', placeholder: 'Тип сукна' },
        { key: 'pockets', label: 'Лузы', type: 'string', placeholder: 'Тип луз' },
        { key: 'frame', label: 'Рама', type: 'string', placeholder: 'Материал рамы' },
      ],
    },
  });

  const ballType = await prisma.type.upsert({
    where: { value: 'balls' },
    update: {
      characteristicFields: [
        { key: 'set', label: 'Комплект', type: 'string', placeholder: 'Количество шаров в комплекте' },
        { key: 'material', label: 'Материал', type: 'string', placeholder: 'Материал шаров' },
        { key: 'weight', label: 'Вес', type: 'number', placeholder: 'Вес шара в граммах' },
      ],
    },
    create: {
      value: 'balls',
      name: 'Шары',
      characteristicFields: [
        { key: 'set', label: 'Комплект', type: 'string', placeholder: 'Количество шаров в комплекте' },
        { key: 'material', label: 'Материал', type: 'string', placeholder: 'Материал шаров' },
        { key: 'weight', label: 'Вес', type: 'number', placeholder: 'Вес шара в граммах' },
      ],
    },
  });

  console.log('✅ Типы товаров созданы');

  // Seed способов доставки
  const existingSdek = await prisma.deliveryMethod.findFirst({ where: { name: 'СДЭК' } });
  if (!existingSdek) {
    await prisma.deliveryMethod.create({
      data: {
        name: 'СДЭК',
        description: 'Курьерская доставка службой СДЭК. Доставка до двери или до пункта выдачи.',
        active: true,
      },
    });
    console.log('✅ Способ доставки "СДЭК" создан');
  }

  const existingPostRussia = await prisma.deliveryMethod.findFirst({ where: { name: 'Почта России' } });
  if (!existingPostRussia) {
    await prisma.deliveryMethod.create({
      data: {
        name: 'Почта России',
        description: 'Доставка через Почту России. Доставка до почтового отделения.',
        active: true,
      },
    });
    console.log('✅ Способ доставки "Почта России" создан');
  }

  // Seed администратора
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.ADMIN, password: passwordHash, verified: new Date() },
    create: {
      fullName: 'Администратор',
      email: adminEmail,
      password: passwordHash,
      role: UserRole.ADMIN,
      verified: new Date(),
    },
  });
  console.log('✅ Администратор создан:', adminEmail, '/', adminPassword);

  // Seed тестового пользователя
  const testUserEmail = 'user@example.com';
  const testUserPassword = 'user123';
  const testUserPasswordHash = await bcrypt.hash(testUserPassword, 10);
  const testUser = await prisma.user.upsert({
    where: { email: testUserEmail },
    update: { password: testUserPasswordHash, verified: new Date() },
    create: {
      fullName: 'Тестовый пользователь',
      email: testUserEmail,
      password: testUserPasswordHash,
      role: UserRole.USER,
      verified: new Date(),
    },
  });
  console.log('✅ Тестовый пользователь создан:', testUserEmail, '/', testUserPassword);

  // Seed товаров с характеристиками
  const existingCue = await prisma.product.findFirst({ where: { title: 'Кий стандарт' } });
  let cueProduct;
  if (!existingCue) {
    cueProduct = await prisma.product.create({
      data: {
        title: 'Кий стандарт',
        description: 'Базовый кий для начинающих игроков. Отличное качество по доступной цене.',
        price: 4990,
        count: 50,
        visible: true,
        typeId: cueType.id,
        characteristic: {
          create: {
            attributes: {
              length: 145,
              weight: 520,
              material: 'Кожа',
              wood: 'Клен',
              master: 'Иванов И.И.',
              country: 'Россия',
            },
          },
        },
      },
    });
    console.log('✅ Товар "Кий стандарт" создан');
  } else {
    cueProduct = existingCue;
  }

  const existingTable = await prisma.product.findFirst({ where: { title: 'Стол 9 футов' } });
  let tableProduct;
  if (!existingTable) {
    tableProduct = await prisma.product.create({
      data: {
        title: 'Стол 9 футов',
        description: 'Профессиональный бильярдный стол 9ft. Идеально подходит для турниров и профессиональной игры.',
        price: 199990,
        count: 5,
        visible: true,
        typeId: tableType.id,
        characteristic: {
          create: {
            attributes: {
              size: '9ft',
              cloth: 'Simonis 860',
              pockets: 'Кожаные',
              frame: 'Дуб',
            },
          },
        },
      },
    });
    console.log('✅ Товар "Стол 9 футов" создан');
  } else {
    tableProduct = existingTable;
  }

  // Добавляем еще несколько товаров для разнообразия
  const existingCuePro = await prisma.product.findFirst({ where: { title: 'Кий профессиональный' } });
  if (!existingCuePro) {
    await prisma.product.create({
      data: {
        title: 'Кий профессиональный',
        description: 'Профессиональный кий для опытных игроков. Премиальное качество и точность.',
        price: 15990,
        count: 20,
        visible: true,
        typeId: cueType.id,
        characteristic: {
          create: {
            attributes: {
              length: 147,
              weight: 540,
              material: 'Кожа премиум',
              wood: 'Эбеновое дерево',
              master: 'Петров П.П.',
              country: 'Россия',
            },
          },
        },
      },
    });
    console.log('✅ Товар "Кий профессиональный" создан');
  }

  const existingBalls = await prisma.product.findFirst({ where: { title: 'Шары бильярдные' } });
  if (!existingBalls) {
    await prisma.product.create({
      data: {
        title: 'Шары бильярдные',
        description: 'Комплект бильярдных шаров для русского бильярда. Высокое качество и долговечность.',
        price: 8990,
        count: 30,
        visible: true,
        typeId: ballType.id,
        characteristic: {
          create: {
            attributes: {
              set: '16 шаров',
              material: 'Фенолформальдегидная смола',
              weight: 285,
            },
          },
        },
      },
    });
    console.log('✅ Товар "Шары бильярдные" создан');
  }

  console.log('🎉 Seeding завершен успешно!');
}

main()
  .catch(async (e) => {
    console.error('❌ Ошибка при seeding:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


