import { ZodSchema, ZodError } from 'zod';

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = result.error as ZodError;
    throw { status: 400, message: 'Validation error', details: error.issues };
  }
  return result.data;
}
