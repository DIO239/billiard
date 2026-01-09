import { z } from 'zod';

export const orderSchema = z.object({
  userId: z.number().nullable().optional(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
  })).min(1, 'Список товаров не может быть пустым').optional(),
  fullName: z.string().min(1, 'ФИО обязательно').optional(),
  email: z.string().email('Некорректный email').optional(),
  phone: z.string().min(1, 'Телефон обязателен').optional(),
  address: z.string().min(1, 'Адрес обязателен').optional(),
  comment: z.string().nullable().optional(),
  deliveryMethodId: z.number().nullable().optional(),
  status: z.enum(['PENDING', 'SUCCEEDED', 'CANCELLED', 'IN_TRANSIT']).optional(),
  totalAmount: z.number().nonnegative().optional(),
  trackingCode: z.string().nullable().optional(),
  paymentId: z.string().nullable().optional(),
});
