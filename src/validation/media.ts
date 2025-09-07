import { z } from 'zod';

export const mediaCreateSchema = z.object({
  productId: z.number().int().positive(),
  type: z.string().min(1),
  name: z.string().min(1),
});

export const mediaUpdateSchema = mediaCreateSchema.partial().omit({ productId: true });

export type MediaCreateInput = z.infer<typeof mediaCreateSchema>;
export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;
