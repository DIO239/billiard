import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

export class ProductService {
  static async list(params?: { 
    skip?: number; 
    take?: number; 
    search?: string; 
    typeId?: number;
    priceMin?: number;
    priceMax?: number;
    visible?: boolean | null;
    sortBy?: 'title' | 'price';
    sortOrder?: 'asc' | 'desc';
  }) {
    const { skip, take, search, typeId, priceMin, priceMax, visible, sortBy, sortOrder } = params || {};
    
    const whereConditions: any[] = [];
    
    // Добавляем фильтр по visible:
    // - Если visible === null, не фильтруем (загружаем все товары, включая скрытые)
    // - Если visible === true, показываем только видимые
    // - Если visible === false, показываем только скрытые
    // - Если visible === undefined (не передан), используем значение по умолчанию true (только видимые)
    if (visible === null) {
      // Не добавляем фильтр - загружаем все товары
    } else if (visible !== undefined) {
      whereConditions.push({ visible });
    } else {
      // visible не передан - используем значение по умолчанию (только видимые)
      whereConditions.push({ visible: true });
    }
    
    if (search) {
      whereConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      });
    }
    
    if (typeId) {
      whereConditions.push({ typeId });
    }
    
    if (priceMin !== undefined) {
      whereConditions.push({ price: { gte: priceMin } });
    }
    
    if (priceMax !== undefined) {
      whereConditions.push({ price: { lte: priceMax } });
    }
    
    // Определяем порядок сортировки
    // По умолчанию сортируем по названию по возрастанию
    const defaultOrder = 'asc';
    const orderDirection = (sortOrder || defaultOrder) === 'asc' ? 'asc' : 'desc';
    
    let orderBy: any;
    if (sortBy === 'price') {
      orderBy = { price: orderDirection };
    } else {
      // По умолчанию сортируем по названию
      orderBy = { title: orderDirection };
    }

    // Проверяем, применены ли фильтры или изменена ли сортировка
    const hasFilters = typeId || priceMin !== undefined || priceMax !== undefined;
    const isDefaultSort = !sortBy || (sortBy === 'title' && sortOrder === 'asc');
    const shouldPrioritizeCues = !hasFilters && isDefaultSort;

    // Если фильтр по типу установлен, используем стандартный запрос
    if (typeId) {
      const queryOptions: any = {
        where: {
          AND: whereConditions,
        },
        include: { media: true, characteristic: true, type: true },
        orderBy,
      };
      
      // Добавляем пагинацию только если указаны skip и take
      if (skip !== undefined && take !== undefined) {
        queryOptions.skip = skip;
        queryOptions.take = take;
      }
      
      return prisma.product.findMany(queryOptions);
    }

    // Если нужно приоритезировать кии (нет фильтров и дефолтная сортировка)
    if (shouldPrioritizeCues) {
      const cuesType = await prisma.type.findUnique({
        where: { value: 'cues' },
        select: { id: true },
      });

      if (cuesType) {
        // Загружаем сначала кии, потом остальные
        const cuesWhere = [...whereConditions, { typeId: cuesType.id }];
        const cuesProducts = await prisma.product.findMany({
          where: {
            AND: cuesWhere,
          },
          include: { media: true, characteristic: true, type: true },
          orderBy,
        });
        
        const otherWhere = [...whereConditions, { typeId: { not: cuesType.id } }];
        const otherProducts = await prisma.product.findMany({
          where: {
            AND: otherWhere,
          },
          include: { media: true, characteristic: true, type: true },
          orderBy,
        });
        
        // Объединяем: сначала кии, потом остальные
        const allProducts = [...cuesProducts, ...otherProducts];
        
        // Применяем пагинацию только если указаны skip и take
        if (skip !== undefined && take !== undefined) {
          return allProducts.slice(skip, skip + take);
        }
        return allProducts;
      }
    }

    // Если фильтры применены или сортировка изменена, используем стандартный запрос
    // (без приоритета киев, только сортировка)
    const queryOptions: any = {
      where: {
        AND: whereConditions,
      },
      include: { media: true, characteristic: true, type: true },
      orderBy,
    };
    
    // Добавляем пагинацию только если указаны skip и take
    if (skip !== undefined && take !== undefined) {
      queryOptions.skip = skip;
      queryOptions.take = take;
    }
    
    return prisma.product.findMany(queryOptions);
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

  static async removeMany(ids: number[]) {
    if (ids.length === 0) {
      return { count: 0 };
    }
    return prisma.product.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
