import { prisma } from './prisma';

export class CartService {
  static async getOrCreate(params: { userId?: number | null; sessionToken?: string | null }) {
    const { userId = null, sessionToken = null } = params;
    let cart = await prisma.cart.findFirst({ 
      where: { OR: [{ userId }, { sessionToken }] }, 
      include: { items: { include: { product: { include: { media: true } } } } } 
    });
    if (!cart) {
      // Если передан userId, проверяем, что пользователь существует
      if (userId !== null) {
        const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
        if (!userExists) {
          console.error(`Попытка создать корзину для несуществующего пользователя: userId=${userId}, type=${typeof userId}`);
          throw { status: 404, message: `Пользователь с ID ${userId} не найден` };
        }
      }
      try {
        cart = await prisma.cart.create({ 
          data: { 
            userId: userId ?? undefined, 
            sessionToken: sessionToken ?? undefined 
          }, 
          include: { items: { include: { product: { include: { media: true } } } } } 
        });
      } catch (error: any) {
        console.error('Ошибка при создании корзины:', {
          error: error.message,
          userId,
          sessionToken,
          userIdType: typeof userId,
        });
        throw error;
      }
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

  /**
   * Сливает корзину гостя (по sessionToken) с корзиной пользователя (по userId)
   * @param userId ID авторизованного пользователя
   * @param sessionToken Session token гостя из cookie
   * @returns Объединенная корзина пользователя
   */
  static async mergeCarts(userId: number, sessionToken: string) {
    console.log(`[CartService.mergeCarts] Начало слияния: userId=${userId}, sessionToken=${sessionToken}`);
    
    // Находим корзину гостя
    const guestCart = await prisma.cart.findFirst({
      where: { sessionToken, userId: null },
      include: { items: { include: { product: true } } },
    });

    console.log(`[CartService.mergeCarts] Корзина гостя найдена:`, guestCart ? { id: guestCart.id, itemsCount: guestCart.items.length } : 'не найдена');

    // Если корзины гостя нет - ничего не делаем
    if (!guestCart || guestCart.items.length === 0) {
      console.log(`[CartService.mergeCarts] Корзина гостя пуста или не найдена, возвращаем корзину пользователя`);
      // Просто возвращаем корзину пользователя (создадим, если её нет)
      const userCart = await this.getOrCreate({ userId, sessionToken: null });
      console.log(`[CartService.mergeCarts] Корзина пользователя:`, { id: userCart.id, itemsCount: userCart.items.length });
      return userCart;
    }

    // Проверяем, что пользователь существует
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) {
      throw { status: 404, message: `Пользователь с ID ${userId} не найден` };
    }

    // Находим или создаем корзину пользователя
    let userCart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!userCart) {
      // Создаем новую корзину для пользователя
      userCart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // Объединяем товары из корзины гостя в корзину пользователя
    // Используем отдельные запросы для проверки существования товаров, чтобы избежать проблем с устаревшими данными
    for (const guestItem of guestCart.items) {
      // Проверяем, существует ли товар в корзине пользователя
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: guestItem.productId,
        },
      });

      const product = await prisma.product.findUnique({
        where: { id: guestItem.productId },
        select: { count: true },
      });

      if (!product) {
        // Товар был удален - пропускаем
        continue;
      }

      if (existingItem) {
        // Товар уже есть в корзине пользователя - увеличиваем количество
        const newQuantity = existingItem.quantity + guestItem.quantity;

        if (newQuantity > product.count) {
          // Если превышает остаток - устанавливаем максимально возможное количество
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: product.count },
          });
        } else {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
          });
        }
      } else {
        // Товара нет в корзине пользователя - добавляем
        const quantity = Math.min(guestItem.quantity, product.count);
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: guestItem.productId,
            quantity,
          },
        });
      }
    }

    // Пересчитываем итоговую сумму
    await this.recalc(userCart.id);

    // Удаляем корзину гостя (если она еще существует)
    try {
      await prisma.cart.delete({ where: { id: guestCart.id } });
    } catch (error) {
      // Игнорируем ошибку, если корзина уже была удалена
      console.warn('Корзина гостя уже была удалена:', error);
    }

    // Возвращаем обновленную корзину пользователя
    const finalCart = await prisma.cart.findUnique({
      where: { id: userCart.id },
      include: { items: { include: { product: true } } },
    });

    if (!finalCart) {
      throw { status: 500, message: 'Не удалось получить корзину пользователя после слияния' };
    }

    console.log(`[CartService.mergeCarts] Слияние завершено успешно:`, { 
      cartId: finalCart.id, 
      itemsCount: finalCart.items.length,
      totalAmount: finalCart.totalAmount 
    });

    return finalCart;
  }
}
