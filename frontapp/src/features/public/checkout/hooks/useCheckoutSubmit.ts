'use client';

/**
 * useCheckoutSubmit.ts
 * Solo crea la orden — la carga del carrito se hace en useCartLoader.
 */

import { useCallback } from 'react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { orderApi } from '@/shared/lib/api/OrdenRepository';
import type { CartItem } from '@/store/checkoutStore';

interface SubmitOrderResult {
  orderId: string;
  email: string;
}

interface UseCheckoutSubmitReturn {
  isSubmitting: boolean;
  error: string | null;
  submitOrder: () => Promise<SubmitOrderResult | null>;
}

export function useCheckoutSubmit(): UseCheckoutSubmitReturn {
  const cartItems = useCheckoutStore((s) => s.cartItems);
  const personalData = useCheckoutStore((s) => s.personalData);
  const shippingData = useCheckoutStore((s) => s.shippingData);
  const orderData = useCheckoutStore((s) => s.orderData);
  const isSubmitting = useCheckoutStore((s) => s.isSubmitting);
  const submitError = useCheckoutStore((s) => s.submitError);
  const setProcessing = useCheckoutStore((s) => s.setProcessing);
  const setIsSubmitting = useCheckoutStore((s) => s.setIsSubmitting);
  const setSubmitError = useCheckoutStore((s) => s.setSubmitError);

  const submitOrder =
    useCallback(async (): Promise<SubmitOrderResult | null> => {
      const selectedItems: CartItem[] = cartItems.filter((i) => i.selected);
      if (selectedItems.length === 0) {
        setSubmitError('No tienes productos seleccionados en tu carrito.');
        return null;
      }

      const hasProducts = selectedItems.some((i) => i.id > 0);

      if (hasProducts) {
        if (
          !shippingData.avenida ||
          !shippingData.distrito ||
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
        const fullName =
          `${personalData.name} ${personalData.apellidoPaterno} ${personalData.apellidoMaterno}`.trim();

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
            shipping_name: fullName,
            shipping_email: personalData.email,
            shipping_phone: personalData.celular,
            shipping_address: shippingAddress,
            shipping_city: `${shippingData.distrito}, ${shippingData.provincia}, ${shippingData.departamento}`,
            shipping_postal_code: shippingData.zipCode || undefined,
            shipping_notes: shippingData.referencia || undefined,
            shipping_cost: orderData.deliveryCost,
            coupon_code: orderData.promoCode || undefined,
            lirios_used: orderData.liriosUsed > 0 ? orderData.liriosUsed : undefined,
          });
        } else {
          order = await orderApi.createOrder({
            shipping_name: fullName,
            shipping_email: personalData.email,
            shipping_phone: personalData.celular,
            coupon_code: orderData.promoCode || undefined,
            lirios_used: orderData.liriosUsed > 0 ? orderData.liriosUsed : undefined,
          });
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

  return { isSubmitting, error: submitError, submitOrder };
}
