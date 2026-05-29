<<<<<<< HEAD
import { useState } from 'react';
import { orderApi } from '@/shared/lib/api/orderRepository';
import { cartApi } from '@/shared/lib/api/cartRepository';
import { addressApi } from '@/shared/lib/api/addressRepository';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useCarritoStore } from '@/store/carritoStore';

export function useCheckoutSubmit() {
    const state = useCheckoutStore();
    const {
        cartItems,
        personalData,
        shippingData,
        orderData,
        setProcessing,
        setStep,
        setOrderResult,
    } = state;

    const [submitError, setSubmitError] = useState<string | null>(null);
=======
'use client';

/**
 * useCheckoutSubmit.ts
 * ARCHIVO: src/features/public/checkout/hooks/useCheckoutSubmit.ts
 *
 * CAMBIO vs versión Culqi:
 *  - submitOrder ya NO cobra — solo crea la orden y devuelve el orderId + email
 *  - El cobro lo hace el Smart Form de Izipay directamente
 *  - Se eliminó: SubmitOrderParams.culqiToken, Paso B (chargeWithCulqi), setOrderResult/setStep
 *    (ahora los maneja OrderSummary al escuchar KR.onPaymentSuccess)
 *
 * Flujo nuevo:
 *  1. Usuario hace clic en "Realizar pedido"
 *  2. submitOrder() crea la orden → devuelve { orderId, email }
 *  3. OrderSummary llama createIzipaySession() → obtiene formToken
 *  4. useIzipay.loadSmartForm(formToken) inyecta el token en el Smart Form
 *  5. El Smart Form cobra al usuario
 *  6. KR.onPaymentSuccess → avanzar al paso 3
 */
>>>>>>> d9aece4d89ab271e219257a158b75b5f636b3361

import { useEffect, useState, useCallback } from 'react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { cartApi } from '@/shared/lib/api/cartRepository';
import { orderApi } from '@/shared/lib/api/OrdenRepository';
import type { CartItem } from '@/store/checkoutStore';

<<<<<<< HEAD
    const clearError = () => setSubmitError(null);

    const submitOrder = async () => {
        setSubmitError(null);
        setProcessing(true);

        try {
            let synced = false;

            if (selectedItems.length > 0) {
                const serverCart = await cartApi.getCart().catch(() => null);
                const serverCount = serverCart?.items?.length ?? 0;
                if (serverCount === 0) {
                    for (const item of selectedItems) {
                        await cartApi.addItem(item.id, item.quantity);
                    }
                    synced = true;
                }
            }

            if (!synced && selectedItems.length === 0) {
                const localItems = useCarritoStore.getState().cartItems;
                if (localItems.length > 0) {
                    await cartApi.clearCart().catch(() => {});
                    for (const item of localItems) {
                        const productId = Number(item.producto_id);
                        const qty = Number(item.cantidad) || 1;
                        if (productId > 0) {
                            await cartApi.addItem(productId, qty);
                        }
                    }
                    synced = true;
                }
            }

            if (!synced && selectedItems.length === 0) {
                const refreshed = await cartApi.getCart().catch(() => null);
                if (!refreshed || !refreshed.items || refreshed.items.length === 0) {
                    throw new Error('No hay productos en tu carrito. Agrega productos antes de realizar el pedido.');
                }
            }

            const fullName = `${personalData.name} ${personalData.apellidoPaterno} ${personalData.apellidoMaterno}`.trim();
            const isPAS = personalData.docType === 'PAS';

            const address = isPAS
                ? [shippingData.direccionPas, shippingData.ciudadPas].filter(Boolean).join(', ')
                : [
                    shippingData.avenida,
                    shippingData.numero,
                    shippingData.pisoLote,
                    shippingData.urbanizacion,
                    shippingData.distrito,
                    shippingData.provincia,
                    shippingData.departamento,
                ].filter(Boolean).join(', ');

            const response = await orderApi.create({
                payment_method: orderData.paymentMethod,
                shipping_name: fullName,
                shipping_email: personalData.email,
                shipping_phone: personalData.celular,
                shipping_address: address,
                shipping_city: shippingData.departamento,
                shipping_postal_code: shippingData.zipCode || undefined,
                shipping_notes: shippingData.referencia || undefined,
                shipping_type: orderData.deliveryMethod,
                shipping_cost: orderData.deliveryCost,
                coupon_code: orderData.promoCode || undefined,
                notes: shippingData.referencia || undefined,
            });

            // Guardar dirección en perfil si el toggle está activo
            if (shippingData.saveAddress && !isPAS) {
                try {
                    await addressApi.create({
                        etiqueta: 'otro',
                        destinatario: fullName,
                        pais: 'Perú',
                        departamento: shippingData.departamento,
                        provincia: shippingData.provincia,
                        distrito: shippingData.distrito,
                        avenida: shippingData.avenida,
                        numero: shippingData.numero,
                        piso_lote: shippingData.pisoLote || null,
                        referencia: shippingData.referencia || null,
                    } as any);
                } catch { /* silencioso — no bloquear la orden */ }
            }

            setOrderResult({
                orderId: response.order_number || `LYR-${Date.now().toString().slice(-6)}`,
                email: personalData.email,
                total: response.total,
                items: selectedItems,
                personalData,
                shippingData,
                orderData,
            });

            try { await cartApi.clearCart(); } catch { /* ignorar */ }

            useCheckoutStore.getState().reset();
            setStep(3);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error inesperado al procesar el pedido.';
            setSubmitError(message);
        } finally {
            setProcessing(false);
=======
// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SubmitOrderResult {
  orderId: string;
  email: string;
}

interface UseCheckoutSubmitReturn {
  isLoading: boolean; // cargando carrito inicial
  isSubmitting: boolean; // creando la orden
  error: string | null;
  /** Crea la orden en el backend. Devuelve orderId y email para la sesión de Izipay. */
  submitOrder: () => Promise<SubmitOrderResult | null>;
  clearError: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCheckoutSubmit(): UseCheckoutSubmitReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCartItems = useCheckoutStore((s) => s.setCartItems);
  const setProcessing = useCheckoutStore((s) => s.setProcessing);
  const personalData = useCheckoutStore((s) => s.personalData);
  const shippingData = useCheckoutStore((s) => s.shippingData);
  const orderData = useCheckoutStore((s) => s.orderData);
  const cartItems = useCheckoutStore((s) => s.cartItems);

  // ── 1. Al montar: cargar carrito del backend → checkoutStore ─────────────
  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      try {
        setIsLoading(true);
        const cart = await cartApi.getCart();

        if (cancelled) return;

        if (!cart.items || cart.items.length === 0) {
          setCartItems([]);
          return;
        }

        const checkoutItems: CartItem[] = cart.items.map((item) => ({
          id: item.productId,
          storeId: 0,
          storeName: '',
          name: item.product.name,
          image: item.product.image ?? '',
          price: item.product.price,
          originalPrice: item.product.price,
          quantity: item.quantity,
          selected: true,
        }));

        setCartItems(checkoutItems);
      } catch (err) {
        if (!cancelled) {
          console.error('Error cargando carrito en checkout:', err);
          setError('No se pudo cargar tu carrito. Intenta recargar la página.');
>>>>>>> d9aece4d89ab271e219257a158b75b5f636b3361
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCart();
    return () => {
      cancelled = true;
    };
  }, [setCartItems]);

  // ── 2. submitOrder: SOLO crea la orden — sin cobro ───────────────────────
  const submitOrder =
    useCallback(async (): Promise<SubmitOrderResult | null> => {
      const selectedItems = cartItems.filter((i) => i.selected);
      if (selectedItems.length === 0) {
        setError('No tienes productos seleccionados en tu carrito.');
        return null;
      }

      if (
        !shippingData.avenida ||
        !shippingData.distrito ||
        !shippingData.departamento
      ) {
        setError('Completa la dirección de envío antes de continuar.');
        return null;
      }

      if (!personalData.email) {
        setError('El correo electrónico es obligatorio.');
        return null;
      }

      setIsSubmitting(true);
      setProcessing(true);
      setError(null);

      try {
        const shippingAddress = [
          shippingData.avenida,
          shippingData.numero,
          shippingData.urbanizacion,
        ]
          .filter(Boolean)
          .join(', ');

        const order = await orderApi.createOrder({
          shipping_name:
            `${personalData.name} ${personalData.apellidoPaterno} ${personalData.apellidoMaterno}`.trim(),
          shipping_email: personalData.email,
          shipping_phone: personalData.celular,
          shipping_address: shippingAddress,
          shipping_city: `${shippingData.distrito}, ${shippingData.provincia}, ${shippingData.departamento}`,
          shipping_postal_code: shippingData.zipCode || undefined,
          shipping_notes: shippingData.referencia || undefined,
          shipping_cost: orderData.deliveryCost,
          coupon_code: orderData.promoCode || undefined,
        });

        // Devolvemos orderId y email para que OrderSummary llame a createIzipaySession
        return { orderId: order.id, email: personalData.email };
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al crear tu pedido. Intenta nuevamente.';
        setError(message);
        return null;
      } finally {
        setIsSubmitting(false);
        setProcessing(false);
      }
    }, [cartItems, shippingData, personalData, orderData, setProcessing]);

  const clearError = useCallback(() => setError(null), []);

<<<<<<< HEAD
    return { submitOrder, clearError, submitError, subtotal, total };
=======
  return { isLoading, isSubmitting, error, submitOrder, clearError };
>>>>>>> d9aece4d89ab271e219257a158b75b5f636b3361
}
