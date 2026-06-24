import { z } from 'zod';

export const ProductFormSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre es muy largo'),

  description: z
    .string()
    .max(5000, 'La descripción es muy larga')
    .optional()
    .default(''),

  price: z
    .union([z.string(), z.number()])
    .transform(v => Number(v))
    .refine(v => !isNaN(v) && v >= 0, 'El precio debe ser un número positivo'),

  stock: z
    .union([z.string(), z.number()])
    .transform(v => Number(v))
    .refine(v => !isNaN(v) && v >= 0, 'El stock debe ser 0 o mayor')
    .default(0),

  category: z
    .string()
    .optional()
    .default(''),

  sku: z
    .string()
    .max(100, 'El SKU es muy largo')
    .optional()
    .default(''),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;
