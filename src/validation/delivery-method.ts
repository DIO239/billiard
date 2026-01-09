import { z } from 'zod';

export const deliveryMethodCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export const deliveryMethodUpdateSchema = deliveryMethodCreateSchema.partial();

export type DeliveryMethodCreateInput = z.infer<typeof deliveryMethodCreateSchema>;
export type DeliveryMethodUpdateInput = z.infer<typeof deliveryMethodUpdateSchema>;
