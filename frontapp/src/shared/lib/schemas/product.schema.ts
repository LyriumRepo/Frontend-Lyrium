import { z } from 'zod';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCHEMAS DE VALIDACIÓN CON ZOD
 * 
 * Estos schemas se usan tanto en cliente (validación inmediata)
 * como en servidor (validación final)
 * ═══════════════════════════════════════════════════════════════════════════
 */

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
  
  regularPrice: z
    .union([z.string(), z.number(), z.null()])
    .transform(v => v ? Number(v) : null)
    .refine(v => v === null || (v >= 0), 'El precio regular debe ser positivo')
    .optional(),
  
  stock: z
    .union([z.string(), z.number()])
    .transform(v => Number(v))
    .refine(v => !isNaN(v) && v >= 0, 'El stock debe ser 0 o mayor')
    .default(0),
  
  category: z
    .string()
    .min(1, 'Selecciona una categoría')
    .optional()
    .default(''),
  
  sku: z
    .string()
    .max(100, 'El SKU es muy largo')
    .optional()
    .default(''),
  
  images: z
    .array(z.string())
    .max(5, 'Máximo 5 imágenes')
    .default([]),
  
  featuredImage: z
    .string()
    .optional()
    .default(''),
  
  nonce: z
    .string()
    .min(10, 'Token de seguridad requerido'),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;

/**
 * Schema para validación de imagen individual
 */
export const ImageUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Archivo requerido' })
    .refine(file => file.size <= 5 * 1024 * 1024, 'Máximo 5MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      'Solo JPEG, PNG, WebP o GIF'
    ),
});

export type ImageUploadData = z.infer<typeof ImageUploadSchema>;
