import { z } from 'zod';

const characteristicFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['string', 'number']),
  placeholder: z.string().optional(),
});

export const typeCreateSchema = z.object({
  value: z.string().min(1),
  name: z.string().min(1),
  characteristicFields: z.array(characteristicFieldSchema).nullable().optional(),
});

export const typeUpdateSchema = typeCreateSchema.partial();

export type TypeCreateInput = z.infer<typeof typeCreateSchema>;
export type TypeUpdateInput = z.infer<typeof typeUpdateSchema>;
