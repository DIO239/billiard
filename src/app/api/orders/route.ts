import errorHandler from '@/app/api/_utils/error-handler';
import { validate } from '../_utils/validate';
import { OrderService } from '@/services/order.service';
import { EmailService } from '@/services/email.service';
import { orderSchema } from '@/validation/order';

export const GET = errorHandler(async (req: Request) => {
  const orders = await OrderService.list();
  return new Response(JSON.stringify(orders), { status: 200 });
});

export const POST = errorHandler(async (req: Request) => {
  const body = await req.json();
  const data = validate(orderSchema, body);
  const order = await OrderService.create(data);
  
  // Отправляем email менеджеру о новом заказе
  try {
    await EmailService.sendOrderNotificationToManager({
      orderNumber: order.orderNumber,
      fullName: order.fullName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      comment: order.comment,
      deliveryMethod: (order as any).deliveryMethod?.name || null,
      items: order.items.map(item => ({
        product: (item as any).product,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    console.error('Ошибка отправки email менеджеру:', error);
    // Не прерываем создание заказа, если email не отправился
  }
  
  return new Response(JSON.stringify(order), { status: 201 });
});
