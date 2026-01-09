import { z } from 'zod';
import { characteristicCreateSchema } from './characteristic';
import { mediaCreateSchema } from './media';

// Базовая схема для создания продукта
export const productCreateSchema = z.object({
  title: z.string().min(1, { message: 'Название обязательно' }),
  description: z.string().min(1, { message: 'Описание обязательно' }),
  price: z.number().positive({ message: 'Цена должна быть положительным числом' }),
  count: z.number().int().nonnegative({ message: 'Количество должно быть неотрицательным целым числом' }),
  visible: z.boolean(),
  typeId: z.number().int().positive({ message: 'ID типа обязателен' }),
});

// Расширенная схема для создания продукта с характеристиками и медиа
export const productCreateWithRelationsSchema = productCreateSchema.extend({
  characteristic: characteristicCreateSchema.omit({ productId: true }).optional(),
  media: z.array(mediaCreateSchema.omit({ productId: true })).optional(),
});

// Схема для обновления продукта
export const productUpdateSchema = productCreateSchema.partial();

// Схема для валидации ответа продукта (response)
export const productResponseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  count: z.number().int().nonnegative(),
  visible: z.boolean(),
  typeId: z.number().int().positive(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  characteristic: z.object({
    id: z.number().int(),
    attributes: z.any().nullable().optional(),
    productId: z.number().int(),
  }).nullable().optional(),
  media: z.array(z.object({
    id: z.number().int(),
    type: z.string(),
    name: z.string(),
    publicId: z.string().nullable().optional(),
    showOnMain: z.boolean().optional(),
    productId: z.number().int(),
  })).optional(),
  type: z.object({
    id: z.number().int(),
    value: z.string(),
    name: z.string(),
    characteristicFields: z.any().nullable().optional(),
  }).optional(),
});

// Схема для валидации списка продуктов
export const productsListResponseSchema = z.object({
  products: z.array(productResponseSchema),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductCreateWithRelationsInput = z.infer<typeof productCreateWithRelationsSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductsListResponse = z.infer<typeof productsListResponseSchema>;
