'use client';

import { useCallback }    from 'react';
import { useCheckoutStore }          from '@/store/checkoutStore';
import { orderApi }                  from '@/shared/lib/api/OrdenRepository';
import { addressApi }                from '@/shared/lib/api/addressRepository';
import type { CartItem, CourierOption, TipoEntrega } from '@/store/checkoutStore';

// ─── Helpers de envío por tienda ────────────────────────────────────────────────
const MARKUP = 1.05;
const applyMarkup = (price: number | null | undefined): number | null =>
  price == null ? null : Math.ceil(price * MARKUP * 100) / 100;
const SHARF_KEYS = ['sharf', 'sharf express'];
const isSharf = (courier: string | undefined | null) =>
  !!courier && SHARF_KEYS.includes(courier.toLowerCase());

function getPrecioFinal(op: CourierOption, tipo: TipoEntrega): number | null {
  if (isSharf(op.courier)) {
    const raw = op.agencia?.precio ?? op.domicilio?.precio ?? op.precio ?? null;
    return applyMarkup(raw);
  }
  if (tipo === 'agencia') {
    if (op.agencia?.disponible && op.agencia.precio != null) return applyMarkup(op.agencia.precio);
    if (op.precio != null) return applyMarkup(op.precio);
    return null;
  }
  if (op.domicilio?.disponible && op.domicilio.precio != null) return applyMarkup(op.domicilio.precio);
  if (op.agencia?.disponible && op.agencia.precio != null) return applyMarkup(op.agencia.precio);
  if (op.precio != null) return applyMarkup(op.precio);
  return null;
}
// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SubmitOrderResult {
  orderId:      string;
  email:        string;
  subtotal:     number;
  shippingCost: number;
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
  const selectedCourier      = useCheckoutStore((s) => s.selectedCourier);
  const selectedTipoEntrega = useCheckoutStore((s) => s.selectedTipoEntrega);
  const shippingQuotes      = useCheckoutStore((s) => s.shippingQuotes);
  const isSubmitting   = useCheckoutStore((s) => s.isSubmitting);
  const submitError    = useCheckoutStore((s) => s.submitError);
  const deliveryMethod = useCheckoutStore((s) => s.orderData.deliveryMethod);
  const selectedBranchId = useCheckoutStore((s) => s.orderData.selectedBranchId);

  // Setters del store
  const setProcessing   = useCheckoutStore((s) => s.setProcessing);
  const setIsSubmitting = useCheckoutStore((s) => s.setIsSubmitting);
  const setSubmitError  = useCheckoutStore((s) => s.setSubmitError);

  // ── Crear la orden ─────────────────────────────────────────────────────────
  const submitOrder = useCallback(async (): Promise<SubmitOrderResult | null> => {

    const selectedItems: CartItem[] = cartItems.filter((i) => i.selected);

    if (selectedItems.length === 0) {
      setSubmitError('No tienes productos seleccionados en tu carrito.');
      return null;
    }

    const hasProducts = selectedItems.some((i) => i.id > 0);

    // Validación de dirección: solo para envío, no para retiro en tienda
    if (hasProducts && deliveryMethod !== 'pickup') {
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

    // Validación de branch: solo para retiro en tienda
    if (hasProducts && deliveryMethod === 'pickup') {
      if (!selectedBranchId) {
        setSubmitError('Selecciona una sucursal de recojo antes de continuar.');
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

      const isPickup = deliveryMethod === 'pickup';

      const storeShipping = !isPickup
        ? shippingQuotes?.tiendas
            ?.filter(t => !t.error)
            .map(t => {
              const op = t.logistica?.opciones?.find(o => o.courier === selectedCourier);
              const costo = getPrecioFinal(op ?? {} as CourierOption, selectedTipoEntrega ?? 'agencia');
              return { store_id: t.tiendaId, shipping_cost: costo ?? 0 };
            })
            .filter(s => s.shipping_cost > 0)
        : undefined;

      const commonFields = {
        shipping_name:  fullName,
        shipping_email: personalData.email,
        shipping_phone: personalData.celular,
        coupon_code:    orderData.promoCode   || undefined,
        lirios_used:    orderData.liriosUsed > 0 ? orderData.liriosUsed : undefined,
        shipping_type:  isPickup ? 'pickup' : selectedTipoEntrega,
        carrier:        isPickup ? undefined : selectedCourier?.toLowerCase(),
        store_shipping: storeShipping?.length ? storeShipping : undefined,
        branch_id:      isPickup ? selectedBranchId : undefined,
        shipping_cost:  isPickup ? 0 : orderData.deliveryCost,
      };

      let order;

      if (hasProducts) {
        if (isPickup) {
          // Retiro en tienda: sin dirección de envío
          order = await orderApi.createOrder(commonFields);
        } else {
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
        }

      } else {
        // Productos digitales / servicios → sin dirección de envío
        order = await orderApi.createOrder(commonFields);
      }

      return { orderId: order.id, email: personalData.email, subtotal: order.subtotal, shippingCost: order.shippingCost };

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
    deliveryMethod,
    selectedBranchId,
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
