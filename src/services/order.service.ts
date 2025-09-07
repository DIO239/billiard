import { prisma } from './prisma';

export type CreateOrderItemInput = {
  productId: number;
  quantity: number;
};

export type CreateOrderInput = {
  userId?: number | null;
  items: CreateOrderItemInput[];
  fullName: string;
  email: string;
  phone: string;
  address: string;
  comment?: string | null;
};

export type UpdateOrderInput = Partial<{
  status: 'PENDING' | 'SUCCEEDED' | 'CANCELLED' | 'IN_TRANSIT';
  trackingCode: string | null;
  paymentId: string | null;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  comment: string | null;
}>;

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${y}${m}${d}-${rand}`;
}

export class OrderService {
  static async list(params?: { skip?: number; take?: number; status?: 'PENDING' | 'SUCCEEDED' | 'CANCELLED' | 'IN_TRANSIT'; userId?: number }) {
    const { skip = 0, take = 20, status, userId } = params || {};
    return prisma.order.findMany({
      where: {
        AND: [status ? { status } : {}, userId ? { userId } : {}],
      },
      include: { items: { include: { product: true } }, user: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: number) {
    return prisma.order.findUnique({ where: { id }, include: { items: { include: { product: true } }, user: true } });
  }

  static async create(input: CreateOrderInput) {
    if (!input.items || input.items.length === 0) throw { status: 400, message: 'Список товаров пуст' };

    // Получаем продукты, проверяем наличие и рассчитываем сумму
    const productIds = Array.from(new Set(input.items.map(it => it.productId)));
    const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, price: true } });
    const priceById = new Map(products.map(p => [p.id, p.price] as const));

    for (const it of input.items) {
      if (!priceById.has(it.productId)) throw { status: 404, message: `Товар ${it.productId} не найден` };
      if (it.quantity <= 0) throw { status: 400, message: 'Количество должно быть положительным' };
    }

    const total = input.items.reduce((sum, it) => sum + (priceById.get(it.productId)! * it.quantity), 0);

    const created = await prisma.order.create({
      data: {
        userId: input.userId ?? undefined,
        orderNumber: generateOrderNumber(),
        totalAmount: Math.round(total),
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        comment: input.comment ?? undefined,
        items: {
          create: input.items.map(it => ({
            productId: it.productId,
            quantity: it.quantity,
            price: priceById.get(it.productId)!,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
    return created;
  }

  static async update(id: number, data: UpdateOrderInput) {
    return prisma.order.update({ where: { id }, data, include: { items: { include: { product: true } } } });
  }

  static async remove(id: number) {
    return prisma.order.delete({ where: { id } });
  }
}


