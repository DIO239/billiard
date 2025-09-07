import { z } from 'zod';

export const identitySchema = z.object({
  userId: z.number().int().positive().optional(),
  sessionToken: z.string().min(1).optional(),
}).refine(v => v.userId || v.sessionToken, { message: 'Нужен userId или sessionToken' });

export const addItemSchema = identitySchema.safeExtend({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

export const updateQtySchema = identitySchema.safeExtend({
  productId: z.number().int().positive(),
  quantity: z.number().int().nonnegative(),
});

export const removeItemSchema = identitySchema.safeExtend({
  productId: z.number().int().positive(),
});

export type IdentityInput = z.infer<typeof identitySchema>;
export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateQtyInput = z.infer<typeof updateQtySchema>;
export type RemoveItemInput = z.infer<typeof removeItemSchema>;
