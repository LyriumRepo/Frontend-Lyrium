'use client';

import { useCallback, useEffect }    from 'react';
import { useCheckoutStore }          from '@/store/checkoutStore';
import { orderApi }                  from '@/shared/lib/api/OrdenRepository';
import { addressApi }                from '@/shared/lib/api/addressRepository';
import { cartApi }                   from '@/shared/lib/api/cartRepository';
import type { CartItem }             from '@/store/checkoutStore';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SubmitOrderResult {
  orderId: string;
  email:   string;
}

interface UseCheckoutSubmitReturn {
  isSubmitting: boolean;
  error:        string | null;
  submitOrder:  () => Promise<SubmitOrderResult | null>;
  clearError:   () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCheckoutSubmit(): UseCheckoutSubmitReturn {
  // Estado del store
  const cartItems      = useCheckoutStore((s) => s.cartItems);
  const personalData   = useCheckoutStore((s) => s.personalData);
  const shippingData   = useCheckoutStore((s) => s.shippingData);
  const orderData      = useCheckoutStore((s) => s.orderData);
  const isSubmitting   = useCheckoutStore((s) => s.isSubmitting);
  const submitError    = useCheckoutStore((s) => s.submitError);
  const cartLoaded     = useCheckoutStore((s) => s.cartLoaded);

  // Setters del store
  const setProcessing   = useCheckoutStore((s) => s.setProcessing);
  const setIsSubmitting = useCheckoutStore((s) => s.setIsSubmitting);
  const setSubmitError  = useCheckoutStore((s) => s.setSubmitError);
  const setCartItems    = useCheckoutStore((s) => s.setCartItems);
  const setCartLoaded   = useCheckoutStore((s) => s.setCartLoaded);
  const setCartLoading  = useCheckoutStore((s) => s.setCartLoading);

  useEffect(() => {
    if (cartLoaded) return;

    let cancelled = false;

    async function loadCart() {
      try {
        setCartLoading(true);
        const cart = await cartApi.getCart();

        if (cancelled) return;

        if (!cart.items || cart.items.length === 0) {
          setCartItems([]);
          setCartLoaded(true);
          return;
        }

        const checkoutItems: CartItem[] = cart.items.map((item) => ({
          id:            item.productId,
          name:          item.name ?? item.product?.name ?? '',
          image:         item.product?.image ?? '',
          price:         item.unitPrice ?? item.product?.price ?? 0,
          originalPrice: item.product?.regular_price ?? item.unitPrice ?? item.product?.price ?? 0,
          quantity:      item.quantity,
          selected:      true,
          storeId:   item.store_id   ?? 0,
          storeName: item.store_name ?? '',
          storeSlug: item.store_slug ?? undefined,
          peso:  item.peso,
          largo: item.largo,
          ancho: item.ancho,
          alto:  item.alto,
          origen: item.origen,

        }));

        setCartItems(checkoutItems);
        setCartLoaded(true);
      } catch (err) {
        if (!cancelled) {
          console.error('Error cargando carrito en checkout:', err);
        }
      } finally {
        if (!cancelled) setCartLoading(false);
      }
    }

    loadCart();
    return () => { cancelled = true; };
  }, [cartLoaded, setCartItems, setCartLoaded, setCartLoading]);

  // ── Crear la orden ─────────────────────────────────────────────────────────
  const submitOrder = useCallback(async (): Promise<SubmitOrderResult | null> => {

    const selectedItems: CartItem[] = cartItems.filter((i) => i.selected);

    if (selectedItems.length === 0) {
      setSubmitError('No tienes productos seleccionados en tu carrito.');
      return null;
    }

    const hasProducts = selectedItems.some((i) => i.id > 0);

    if (hasProducts) {
      if (
        !shippingData.avenida    ||
        !shippingData.distrito   ||
        !shippingData.provincia  ||
        !shippingData.departamento
      ) {
        setSubmitError('Completa la dirección de envío antes de continuar.');
        return null;
      }
    }

    if (!personalData.email) {
      setSubmitError('El correo electrónico es obligatorio.');
      return null;
    }

    setIsSubmitting(true);
    setProcessing(true);
    setSubmitError(null);

    try {
      const fullName = [
        personalData.name,
        personalData.apellidoPaterno,
        personalData.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(' ');

      const commonFields = {
        shipping_name:  fullName,
        shipping_email: personalData.email,
        shipping_phone: personalData.celular,
        coupon_code:    orderData.promoCode   || undefined,
        lirios_used:    orderData.liriosUsed > 0 ? orderData.liriosUsed : undefined,
      };

      let order;

      if (hasProducts) {
        const shippingAddress = [
          shippingData.avenida,
          shippingData.numero,
          shippingData.urbanizacion,
        ]
          .filter(Boolean)
          .join(', ');

        order = await orderApi.createOrder({
          ...commonFields,
          shipping_address:     shippingAddress,
          shipping_city:        `${shippingData.distrito}, ${shippingData.provincia}, ${shippingData.departamento}`,
          shipping_postal_code: shippingData.zipCode    || undefined,
          shipping_notes:       shippingData.referencia || undefined,
          shipping_cost:        orderData.deliveryCost,
        });

        // Guardar dirección si el usuario lo solicitó (no bloquea el flujo si falla)
        if (shippingData.saveAddress) {
          addressApi.create({
            etiqueta:     'otro',
            destinatario: fullName,
            pais:         shippingData.pais || 'Perú',
            departamento: shippingData.departamento,
            provincia:    shippingData.provincia,
            distrito:     shippingData.distrito,
            avenida:      shippingData.avenida,
            numero:       shippingData.numero,
            piso_lote:    shippingData.pisoLote   || null,
            referencia:   shippingData.referencia || null,
            is_default:   false,
          }).catch(() => { /* silencioso — no es crítico */ });
        }

      } else {
        // Productos digitales / servicios → sin dirección de envío
        order = await orderApi.createOrder(commonFields);
      }

      return { orderId: order.id, email: personalData.email };

    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al crear tu pedido. Intenta nuevamente.';
      setSubmitError(message);
      return null;
    } finally {
      setIsSubmitting(false);
      setProcessing(false);
    }
  }, [
    cartItems,
    shippingData,
    personalData,
    orderData,
    setProcessing,
    setIsSubmitting,
    setSubmitError,
  ]);

  return {
    isSubmitting,
    error:      submitError,
    submitOrder,
    clearError: () => setSubmitError(null),
  };
}
