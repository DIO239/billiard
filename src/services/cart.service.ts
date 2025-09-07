import { prisma } from './prisma';

export class CartService {
  static async getOrCreate(params: { userId?: number | null; sessionToken?: string | null }) {
    const { userId = null, sessionToken = null } = params;
    let cart = await prisma.cart.findFirst({ where: { OR: [{ userId }, { sessionToken }] }, include: { items: true } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: userId ?? undefined, sessionToken: sessionToken ?? undefined }, include: { items: true } });
    }
    return cart;
  }

  static async recalc(cartId: number) {
    const items = await prisma.cartItem.findMany({ where: { cartId }, include: { product: true } });
    const total = items.reduce((sum, it) => sum + (it.quantity * (it.product?.price ?? 0)), 0);
    await prisma.cart.update({ where: { id: cartId }, data: { totalAmount: Math.round(total) } });
  }

  static async addItem(cartId: number, productId: number, quantity: number = 1) {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { count: true } });
    if (!product) throw { status: 404, message: 'Товар не найден' };

    const existing = await prisma.cartItem.findFirst({ where: { cartId, productId } });
    const currentQty = existing ? existing.quantity : 0;
    const desiredQty = currentQty + quantity;
    if (desiredQty > product.count) throw { status: 409, message: 'Недостаточно товара на складе' };

    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: desiredQty } });
    } else {
      await prisma.cartItem.create({ data: { cartId, productId, quantity } });
    }
    await this.recalc(cartId);
    return prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: true } } } });
  }

  static async updateQty(cartId: number, productId: number, quantity: number) {
    const existing = await prisma.cartItem.findFirst({ where: { cartId, productId } });
    if (!existing) return null;

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { count: true } });
    if (!product) throw { status: 404, message: 'Товар не найден' };

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: existing.id } });
      await this.recalc(cartId);
      return prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: true } } } });
    }

    if (quantity > product.count) throw { status: 409, message: 'Недостаточно товара на складе' };

    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } });
    await this.recalc(cartId);
    return prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: true } } } });
  }

  static async removeItem(cartId: number, productId: number) {
    const existing = await prisma.cartItem.findFirst({ where: { cartId, productId } });
    if (!existing) return null;
    await prisma.cartItem.delete({ where: { id: existing.id } });
    await this.recalc(cartId);
    return prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: true } } } });
  }

  static async clear(cartId: number) {
    await prisma.cartItem.deleteMany({ where: { cartId } });
    await prisma.cart.update({ where: { id: cartId }, data: { totalAmount: 0 } });
    return prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } });
  }
}
