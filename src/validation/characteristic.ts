import { z } from 'zod';

export const characteristicCreateSchema = z.object({
  productId: z.number().int().positive(),
  height: z.number().nonnegative().nullable().optional(),
  weight: z.number().nonnegative().nullable().optional(),
  material: z.string().min(1).nullable().optional(),
  wood: z.string().min(1).nullable().optional(),
  master: z.string().min(1).nullable().optional(),
  country: z.string().min(1).nullable().optional(),
  parts: z.string().min(1).nullable().optional(),
});

export const characteristicUpdateSchema = characteristicCreateSchema.partial().omit({ productId: true });

export type CharacteristicCreateInput = z.infer<typeof characteristicCreateSchema>;
export type CharacteristicUpdateInput = z.infer<typeof characteristicUpdateSchema>;
