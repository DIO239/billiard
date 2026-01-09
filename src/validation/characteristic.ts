import { z } from 'zod';

export const characteristicCreateSchema = z.object({
  productId: z.number().int().positive(),
  attributes: z.any().nullable().optional(),
});

export const characteristicUpdateSchema = characteristicCreateSchema.partial().omit({ productId: true });

export type CharacteristicCreateInput = z.infer<typeof characteristicCreateSchema>;
export type CharacteristicUpdateInput = z.infer<typeof characteristicUpdateSchema>;
