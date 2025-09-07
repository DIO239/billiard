import { z } from 'zod';

export const productCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  count: z.number().int().nonnegative(),
  visible: z.boolean(),
  typeId: z.number().int().positive(),
});

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
