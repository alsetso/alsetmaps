import { z } from 'zod';

// Box creation validation schema
export const createBoxSchema = z.object({
  description: z.string().optional().nullable(),
  price: z.number().positive().optional().nullable(),
  state: z.string().min(2).max(50).optional().nullable(),
  city: z.string().min(1).max(100).optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
});

// Box update validation schema
export const updateBoxSchema = z.object({
  description: z.string().optional().nullable(),
  price: z.number().positive().optional().nullable(),
  state: z.string().min(2).max(50).optional().nullable(),
  city: z.string().min(1).max(100).optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

// Type exports for TypeScript
export type CreateBoxRequest = z.infer<typeof createBoxSchema>;
export type UpdateBoxRequest = z.infer<typeof updateBoxSchema>;
