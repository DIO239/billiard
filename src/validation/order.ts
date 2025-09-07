import { z } from 'zod';

export const orderSchema = z.object({
  userId: z.number(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
  })),
  totalAmount: z.number().min(0),
  status: z.enum(['pending', 'paid', 'shipped', 'completed', 'cancelled']),
});
