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
  const sdek = await prisma.deliveryMethod.upsert({
    where: { id: 1 },
    update: {
      name: 'СДЭК',
      description: 'Курьерская доставка службой СДЭК. Доставка до двери или до пункта выдачи.',
      active: true,
    },
    create: {
      name: 'СДЭК',
      description: 'Курьерская доставка службой СДЭК. Доставка до двери или до пункта выдачи.',
      active: true,
    },
  });

  const postRussia = await prisma.deliveryMethod.upsert({
    where: { id: 2 },
    update: {
      name: 'Почта России',
      description: 'Доставка через Почту России. Доставка до почтового отделения.',
      active: true,
    },
    create: {
      name: 'Почта России',
      description: 'Доставка через Почту России. Доставка до почтового отделения.',
      active: true,
    },
  });

  console.log('✅ Способы доставки созданы');

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

  // Seed товаров - создаем 50 различных товаров
  console.log('🌱 Создание 50 товаров...');

  // Варианты для киев
  const cueTitles = [
    'Кий стандарт', 'Кий профессиональный', 'Кий премиум', 'Кий классический',
    'Кий турнирный', 'Кий мастер', 'Кий элитный', 'Кий спортивный',
    'Кий традиционный', 'Кий современный', 'Кий легкий', 'Кий тяжелый',
    'Кий сбалансированный', 'Кий длинный', 'Кий короткий', 'Кий средний',
    'Кий для начинающих', 'Кий для профи', 'Кий кастомный', 'Кий серийный',
    'Кий ручной работы', 'Кий фабричный', 'Кий эксклюзивный', 'Кий базовый',
    'Кий продвинутый'
  ];
  const cueDescriptions = [
    'Базовый кий для начинающих игроков. Отличное качество по доступной цене.',
    'Профессиональный кий для опытных игроков. Премиальное качество и точность.',
    'Элитный кий ручной работы. Идеальный баланс и контроль.',
    'Классический кий с традиционным дизайном. Проверенное качество.',
    'Турнирный кий для соревнований. Максимальная точность удара.',
    'Кий от мастера. Индивидуальная настройка и превосходное качество.',
    'Премиальный кий из редких пород дерева. Эксклюзивная модель.',
    'Спортивный кий для активной игры. Легкий и маневренный.',
    'Традиционный кий с историей. Классический стиль и надежность.',
    'Современный кий с инновационными технологиями. Оптимальные характеристики.',
    'Легкий кий для быстрой игры. Отличная маневренность.',
    'Тяжелый кий для мощных ударов. Стабильность и контроль.',
    'Сбалансированный кий для универсальной игры. Идеальный выбор.',
    'Длинный кий для высоких игроков. Комфортная игра.',
    'Короткий кий для компактных условий. Удобство использования.',
    'Средний кий универсального размера. Подходит большинству игроков.',
    'Кий для начинающих с мягкой наклейкой. Легкое обучение.',
    'Кий для профессионалов. Максимальная точность и контроль.',
    'Кастомный кий по индивидуальному заказу. Уникальный дизайн.',
    'Серийный кий проверенного качества. Надежность и доступность.',
    'Кий ручной работы от мастера. Эксклюзивное исполнение.',
    'Фабричный кий массового производства. Качество и доступность.',
    'Эксклюзивный кий ограниченной серии. Уникальность и престиж.',
    'Базовый кий для домашней игры. Отличное соотношение цена-качество.',
    'Продвинутый кий для опытных игроков. Высокие характеристики.'
  ];
  const cueMaterials = ['Кожа', 'Кожа премиум', 'Кожа итальянская', 'Кожа немецкая', 'Кожа мягкая', 'Кожа жесткая'];
  const cueWoods = ['Клен', 'Эбеновое дерево', 'Дуб', 'Орех', 'Вишня', 'Бук', 'Ясень', 'Махагон'];
  const cueMasters = ['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.', 'Кузнецов К.К.', 'Смирнов С.С.', 'Волков В.В.'];
  const cueCountries = ['Россия', 'Бельгия', 'Италия', 'Германия', 'США', 'Китай'];

  // Варианты для столов
  const tableTitles = [
    'Стол 9 футов', 'Стол 8 футов', 'Стол 7 футов', 'Стол профессиональный',
    'Стол турнирный', 'Стол домашний', 'Стол клубный', 'Стол премиум',
    'Стол классический', 'Стол современный', 'Стол элитный', 'Стол стандартный',
    'Стол компактный', 'Стол большой', 'Стол средний'
  ];
  const tableDescriptions = [
    'Профессиональный бильярдный стол 9ft. Идеально подходит для турниров и профессиональной игры.',
    'Стандартный стол 8ft. Отличный выбор для домашнего использования и клубов.',
    'Компактный стол 7ft. Идеален для небольших помещений.',
    'Профессиональный стол высшего класса. Максимальное качество и точность.',
    'Турнирный стол для соревнований. Соответствует всем стандартам.',
    'Домашний стол для семейной игры. Комфорт и качество.',
    'Клубный стол для бильярдных залов. Надежность и долговечность.',
    'Премиальный стол с эксклюзивной отделкой. Роскошь и качество.',
    'Классический стол традиционного дизайна. Проверенное качество.',
    'Современный стол с инновационными технологиями. Оптимальные характеристики.',
    'Элитный стол ручной работы. Эксклюзивное исполнение.',
    'Стандартный стол для универсального использования. Надежность.',
    'Компактный стол для небольших помещений. Удобство и функциональность.',
    'Большой стол для просторных залов. Максимальный комфорт игры.',
    'Средний стол универсального размера. Подходит для разных условий.'
  ];
  const tableSizes = ['7ft', '8ft', '9ft', '10ft'];
  const tableCloths = ['Simonis 860', 'Simonis 760', 'Iwan Simonis', 'Strachan', 'Hainsworth', 'Worsted'];
  const tablePockets = ['Кожаные', 'Резиновые', 'Пластиковые', 'Металлические'];
  const tableFrames = ['Дуб', 'Орех', 'Вишня', 'Махагон', 'МДФ', 'Металл'];

  // Варианты для шаров
  const ballTitles = [
    'Шары бильярдные', 'Шары профессиональные', 'Шары турнирные', 'Шары стандартные',
    'Шары премиум', 'Шары классические', 'Шары современные', 'Шары элитные',
    'Шары для русского бильярда', 'Шары для пула', 'Шары для снукера', 'Шары базовые',
    'Шары продвинутые', 'Шары кастомные', 'Шары серийные'
  ];
  const ballDescriptions = [
    'Комплект бильярдных шаров для русского бильярда. Высокое качество и долговечность.',
    'Профессиональные шары для соревнований. Максимальная точность и баланс.',
    'Турнирные шары высшего качества. Соответствуют всем стандартам.',
    'Стандартный комплект шаров. Отличное качество по доступной цене.',
    'Премиальные шары из лучших материалов. Исключительное качество.',
    'Классические шары традиционного дизайна. Проверенное качество.',
    'Современные шары с улучшенными характеристиками. Оптимальные свойства.',
    'Элитные шары ограниченной серии. Эксклюзивное исполнение.',
    'Шары специально для русского бильярда. Идеальный баланс и вес.',
    'Шары для игры в пул. Стандартные размеры и характеристики.',
    'Шары для снукера. Профессиональное качество.',
    'Базовый комплект шаров. Надежность и доступность.',
    'Продвинутые шары для опытных игроков. Высокие характеристики.',
    'Кастомные шары по индивидуальному заказу. Уникальный дизайн.',
    'Серийные шары проверенного качества. Надежность и доступность.'
  ];
  const ballSets = ['16 шаров', '15 шаров', '14 шаров', '12 шаров', '10 шаров'];
  const ballMaterials = ['Фенолформальдегидная смола', 'Полиэстер', 'Арамид', 'Полиуретан'];
  const ballWeights = [280, 285, 290, 295, 300];

  // Функция для получения случайного элемента из массива
  const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Создаем 25 киев
  for (let i = 0; i < 25; i++) {
    const title = cueTitles[i] || `Кий модель ${i + 1}`;
    const existing = await prisma.product.findFirst({ where: { title } });
    if (!existing) {
      await prisma.product.create({
        data: {
          title,
          description: cueDescriptions[i] || 'Качественный бильярдный кий.',
          price: getRandomInt(3000, 25000),
          count: getRandomInt(5, 100),
          visible: Math.random() > 0.1, // 90% видимых
          typeId: cueType.id,
          characteristic: {
            create: {
              attributes: {
                length: getRandomInt(140, 150),
                weight: getRandomInt(500, 600),
                material: getRandomItem(cueMaterials),
                wood: getRandomItem(cueWoods),
                master: getRandomItem(cueMasters),
                country: getRandomItem(cueCountries),
              },
            },
          },
        },
      });
    }
  }

  // Создаем 15 столов
  for (let i = 0; i < 15; i++) {
    const title = tableTitles[i] || `Стол модель ${i + 1}`;
    const existing = await prisma.product.findFirst({ where: { title } });
    if (!existing) {
      await prisma.product.create({
        data: {
          title,
          description: tableDescriptions[i] || 'Качественный бильярдный стол.',
          price: getRandomInt(50000, 300000),
          count: getRandomInt(1, 20),
          visible: Math.random() > 0.1, // 90% видимых
          typeId: tableType.id,
          characteristic: {
            create: {
              attributes: {
                size: getRandomItem(tableSizes),
                cloth: getRandomItem(tableCloths),
                pockets: getRandomItem(tablePockets),
                frame: getRandomItem(tableFrames),
              },
            },
          },
        },
      });
    }
  }

  // Создаем 10 комплектов шаров
  for (let i = 0; i < 10; i++) {
    const title = ballTitles[i] || `Шары модель ${i + 1}`;
    const existing = await prisma.product.findFirst({ where: { title } });
    if (!existing) {
      await prisma.product.create({
        data: {
          title,
          description: ballDescriptions[i] || 'Качественный комплект бильярдных шаров.',
          price: getRandomInt(3000, 15000),
          count: getRandomInt(5, 50),
          visible: Math.random() > 0.1, // 90% видимых
          typeId: ballType.id,
          characteristic: {
            create: {
              attributes: {
                set: getRandomItem(ballSets),
                material: getRandomItem(ballMaterials),
                weight: getRandomItem(ballWeights),
              },
            },
          },
        },
      });
    }
  }

  console.log('✅ 50 товаров созданы');
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


