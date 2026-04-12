/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EJEMPLO: Manejo de Nonce Expirado con useActionState
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este ejemplo muestra cómo:
 * 1. La Server Action detecta nonce expirado
 * 2. Devuelve un código de error especial
 * 3. El cliente usa useActionState para detectar y manejar el error
 * 4. El usuario recibe un mensaje amigable y puede reintentar
 */

'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Tipos de resultado para la Server Action
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type ActionState<T = unknown> =
  | { success: true; data?: T; message?: string }
  | {
    success: false;
    error: string;
    code?: 'NONCE_EXPIRED' | 'SESSION_EXPIRED' | 'VALIDATION_ERROR' | 'SERVER_ERROR';
    fieldErrors?: Record<string, string[]>;
  };

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Schema de validación con Zod
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ProductFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'Nombre muy largo'),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()])
    .transform(v => Number(v))
    .refine(v => v >= 0, 'El precio debe ser positivo'),
  stock: z.union([z.string(), z.number()])
    .transform(v => Number(v))
    .refine(v => v >= 0, 'El stock debe ser positivo')
    .optional()
    .default(0),
  category: z.string().optional(),
  nonce: z.string().min(1, 'Token de seguridad requerido'),
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Server Action: Guardar producto con validación de nonce
 * ═══════════════════════════════════════════════════════════════════════════
 */

export async function saveProductWithNonce(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Extraer y validar datos
  const validated = ProductFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    stock: formData.get('stock'),
    category: formData.get('category'),
    nonce: formData.get('nonce'),
  });

  if (!validated.success) {
    const errors = validated.error.flatten().fieldErrors;
    return {
      success: false,
      error: 'Por favor, corrige los errores en el formulario',
      code: 'VALIDATION_ERROR',
      fieldErrors: {
        name: errors.name || [],
        price: errors.price || [],
        stock: errors.stock || [],
      },
    };
  }

  const { name, description, price, stock, category, nonce } = validated.data;

  // 2. Verificar nonce de WordPress
  const isValidNonce = await verifyWordPressNonce(nonce, 'save_product');

  if (!isValidNonce) {
    // Nonce expirado - código de error especial
    return {
      success: false,
      error: 'Tu sesión ha expirado. Por favor, recarga la página e intenta de nuevo.',
      code: 'NONCE_EXPIRED',
    };
  }

  // 3. Verificar sesión
  const session = await getWordPressSession();
  if (!session) {
    return {
      success: false,
      error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      code: 'SESSION_EXPIRED',
    };
  }

  try {
    // 4. Guardar en WooCommerce
    // await wcApi.post('/products', { ... });

    await new Promise(r => setTimeout(r, 500)); // Simular API

    // 5. Revalidar cache
    revalidateTag('seller-catalog', 'max');

    return {
      success: true,
      data: { id: '123', name },
      message: 'Producto guardado correctamente',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al guardar el producto. Intenta de nuevo.',
      code: 'SERVER_ERROR',
    };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Funciones auxiliares de verificación
 * ═══════════════════════════════════════════════════════════════════════════
 */

async function verifyWordPressNonce(nonce: string, action: string): Promise<boolean> {
  // En producción: llamada a endpoint de WP que usa wp_verify_nonce()
  // Por ahora simulamos
  if (!nonce || nonce.length < 10) return false;
  return true; // Simulación
}

async function getWordPressSession(): Promise<{ user_id: number } | null> {
  // En producción: leer cookies de sesión
  return { user_id: 1 }; // Simulación
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CLIENT COMPONENT: Formulario con useActionState
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
'use client';

import { useActionState, useEffect, useState } from 'react';
import { saveProductWithNonce, ActionState } from '@/shared/lib/actions/product-form';
import { useRouter } from 'next/navigation';

export function ProductForm() {
  const router = useRouter();
  const [nonce, setNonce] = useState('');
  
  // useActionState maneja el estado de la Server Action
  // El segundo argumento es el estado inicial
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    saveProductWithNonce,
    { success: false, error: '' }
  );

  // Efecto para manejar errores específicos
  useEffect(() => {
    if (!state.success && state.code === 'NONCE_EXPIRED') {
      // Mostrar modal de sesión expirada
      alert('Tu sesión ha expirado. Por favor, recarga la página.');
      // O redirigir al login
      // router.push('/login');
    }
    
    if (!state.success && state.code === 'SESSION_EXPIRED') {
      // Redirigir a login
      window.location.href = '/login?reason=session_expired';
    }
  }, [state, router]);

  // Obtener nonce del cliente (desde window.wpApiSettings o API)
  useEffect(() => {
    // En producción: obtener nonce de WordPress
    setNonce('simulated_nonce_' + Date.now());
  }, []);

  // Mostrar errores de validación específicos
  const fieldErrors = state.fieldErrors || {};

  return (
    <form action={formData} className="space-y-4">
      <input type="hidden" name="nonce" value={nonce} />
      
      {/* Campo nombre con error específico *}
      <div>
        <label htmlFor="name">Nombre del producto</label>
        <input 
          id="name" 
          name="name" 
          type="text"
          aria-describedby="name-error"
        />
        {fieldErrors.name && (
          <p id="name-error" className="error">
            {fieldErrors.name[0]}
          </p>
        )}
      </div>

      {/* Campo precio *}
      <div>
        <label htmlFor="price">Precio</label>
        <input 
          id="price" 
          name="price" 
          type="number" 
          step="0.01"
        />
        {fieldErrors.price && (
          <p className="error">{fieldErrors.price[0]}</p>
        )}
      </div>

      {/* Descripción *}
      <div>
        <label htmlFor="description">Descripción</label>
        <textarea id="description" name="description" />
      </div>

      {/* Mensaje de error general o éxito *}
      {!state.success && state.error && (
        <div role="alert" className={state.code === 'NONCE_EXPIRED' ? 'warning' : 'error'}>
          {state.error}
          {state.code === 'NONCE_EXPIRED' && (
            <button 
              type="button" 
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          )}
        </div>
      )}

      {state.success && state.message && (
        <div role="status" className="success">
          {state.message}
        </div>
      )}

      {/* Botón de submit *}
      <button 
        type="submit" 
        disabled={isPending || !nonce}
      >
        {isPending ? 'Guardando...' : 'Guardar producto'}
      </button>
    </form>
  );
}
*/
