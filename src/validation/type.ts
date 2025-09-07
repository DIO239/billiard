import { z } from 'zod';

export const typeCreateSchema = z.object({
  value: z.string().min(1),
  name: z.string().min(1),
});

export const typeUpdateSchema = typeCreateSchema.partial();

export type TypeCreateInput = z.infer<typeof typeCreateSchema>;
export type TypeUpdateInput = z.infer<typeof typeUpdateSchema>;
