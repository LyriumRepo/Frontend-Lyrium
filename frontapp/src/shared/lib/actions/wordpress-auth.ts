/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVER ACTIONS CON WORDPRESS AUTH (nonce/CSRF)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * WordPress usa nonces para protección CSRF. El flujo típico es:
 * 1. wp_localize_script() → pasar nonce al frontend
 * 2. Verificar con wp_verify_nonce() en el server
 * 
 * Para Server Actions, necesitamos un enfoque diferente.
 */

'use server';

import { revalidateTag } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { API_CONFIG } from '../config/api';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPCIÓN 1: Basic Auth con Consumer Key/Secret (WC API)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Pros: Simple, sin manage de nonces
 * Cons: Credenciales en server-side
 */

async function getWooClient() {
  const axios = (await import('axios')).default;

  const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
  const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;

  if (!key || !secret) {
    throw new Error('WooCommerce credentials not configured');
  }

  return axios.create({
    baseURL: API_CONFIG.wcApiUrl,
    auth: {
      username: key,
      password: secret,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPCIÓN 2: WP Session Cookie + Nonce (Más seguro para acciones de usuario)
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface WPSession {
  user_id: number;
  username: string;
  nonce: string;
}

async function getWPSession(): Promise<WPSession | null> {
  // Next.js 15+: cookies() es async
  const cookieStore = await cookies();

  const wpSession = cookieStore.get('wp_session');
  const wpUserId = cookieStore.get('wp_user_id');
  const wpUsername = cookieStore.get('wp_username');
  const wpNonce = cookieStore.get('wp_nonce');

  if (!wpSession || !wpUserId || !wpNonce) {
    return null;
  }

  return {
    user_id: Number(wpUserId.value),
    username: wpUsername?.value || '',
    nonce: wpNonce.value,
  };
}

async function verifyWPNonce(nonce: string, action: string = 'wp_rest'): Promise<boolean> {
  // Verificar nonce contra WordPress
  // Esto requiere un endpoint en WP que llame a wp_verify_nonce()

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/wp-json/custom/v1/verify-nonce`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, action }),
        cache: 'no-store',
      }
    );

    if (!response.ok) return false;

    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: Actualizar pedido
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { z } from 'zod';

const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1, 'ID de orden requerido'),
  newStatus: z.enum(['pending', 'processing', 'completed', 'cancelled', 'refunded']),
  nonce: z.string().min(1, 'Nonce requerido'),
});

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateOrderStatus(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // 1. Validar input con Zod
  const validated = UpdateOrderStatusSchema.safeParse({
    orderId: formData.get('orderId'),
    newStatus: formData.get('newStatus'),
    nonce: formData.get('nonce'),
  });

  if (!validated.success) {
    return {
      success: false,
      error: 'Datos inválidos',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const { orderId, newStatus, nonce } = validated.data;

  // 2. Verificar sesión de WordPress
  const session = getWPSession();

  if (!session) {
    return {
      success: false,
      error: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
    };
  }

  // 3. Verificar nonce (protección CSRF)
  const isValidNonce = await verifyWPNonce(nonce, `update_order_${orderId}`);

  if (!isValidNonce) {
    return {
      success: false,
      error: 'Token de seguridad expirado. Recarga la página e intenta de nuevo.',
    };
  }

  // 4. Ejecutar la mutación en WooCommerce
  try {
    const wc = await getWooClient();

    const response = await wc.post(`/orders/${orderId}`, {
      status: newStatus,
    }, {
      params: {
        _method: 'PUT', // WooCommerce REST API requiere esto para PUT
      },
    });

    // 5. Revalidar cache
    revalidateTag('seller-orders', 'max');
    revalidateTag('seller-order-detail', 'max');
    revalidateTag('seller-kpis', 'max');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Order update failed:', error);
    return {
      success: false,
      error: 'No se pudo actualizar el pedido. Intenta de nuevo.',
    };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: Crear producto
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CreateProductSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(200),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()]).transform(v => Number(v)),
  regular_price: z.union([z.string(), z.number(), z.null()]).optional().transform(v => v ? Number(v) : undefined),
  stock: z.union([z.string(), z.number()]).transform(v => Number(v)).optional(),
  category_ids: z.array(z.number()).optional(),
  images: z.array(z.string()).optional(),
  nonce: z.string().min(1),
});

export async function createProduct(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = getWPSession();

  if (!session) {
    return { success: false, error: 'Sesión requerida' };
  }

  const nonce = formData.get('nonce') as string;
  const isValidNonce = await verifyWPNonce(nonce, 'create_product');

  if (!isValidNonce) {
    return { success: false, error: 'Nonce inválido' };
  }

  const validated = CreateProductSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    regular_price: formData.get('regular_price'),
    stock: formData.get('stock'),
    category_ids: formData.get('category_ids') ? JSON.parse(formData.get('category_ids') as string) : undefined,
    images: formData.get('images') ? JSON.parse(formData.get('images') as string) : undefined,
    nonce,
  });

  if (!validated.success) {
    return {
      success: false,
      error: 'Validación fallida',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const wc = await getWooClient();

    const response = await wc.post('/products', {
      name: validated.data.name,
      description: validated.data.description,
      regular_price: String(validated.data.regular_price ?? validated.data.price),
      price: String(validated.data.price),
      stock_quantity: validated.data.stock,
      categories: validated.data.category_ids?.map(id => ({ id })),
      images: validated.data.images?.map(src => ({ src })),
      status: 'publish',
    });

    revalidateTag('seller-products', 'max');

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: 'Error al crear producto' };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOOK: Usar Server Actions con optimistic updates
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
'use client';

import { useTransition, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Guardando...' : 'Guardar'}
    </button>
  );
}

function CreateProductForm() {
  const [state, action] = useFormState(createProduct, { success: false });
  const [optimisticProduct, setOptimisticProduct] = useState(null);

  // Para optimistic updates, usamos el patrón:
  // 1. Optimistic UI se maneja en el cliente
  // 2. Server Action retorna éxito/error
  // 3. Si error, revertimos el estado

  return (
    <form action={action}>
      <input type="hidden" name="nonce" value={window.wpApiSettings?.nonce} />
      {/* ... campos del formulario ... *}
      <SubmitButton />
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
*/
