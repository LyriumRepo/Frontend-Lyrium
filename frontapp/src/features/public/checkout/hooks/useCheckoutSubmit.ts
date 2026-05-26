import { useState } from 'react';
import { orderApi } from '@/shared/lib/api/orderRepository';
import { cartApi } from '@/shared/lib/api/cartRepository';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useCarritoStore } from '@/store/carritoStore';

export function useCheckoutSubmit() {
    const {
        cartItems,
        personalData,
        shippingData,
        orderData,
        setProcessing,
        setStep,
        setOrderResult,
    } = useCheckoutStore();

    const [submitError, setSubmitError] = useState<string | null>(null);

    const selectedItems = cartItems.filter((i) => i.selected);
    const subtotal = selectedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const total = subtotal + orderData.deliveryCost - orderData.discount;

    const clearError = () => setSubmitError(null);

    const submitOrder = async () => {
        setSubmitError(null);
        setProcessing(true);

        try {
            // Intentar sincronizar items al backend antes de crear la orden
            let synced = false;

            // 1. Si el checkoutStore tiene items, sincronizarlos
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

            // 2. Si no hay items en checkoutStore, buscar en carritoStore local
            if (!synced && selectedItems.length === 0) {
                const localItems = useCarritoStore.getState().cartItems;
                if (localItems.length > 0) {
                    // Limpiar carrito del backend y luego sincronizar items locales
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

            // 3. Si aún no hay items, intentar recargar carrito desde backend
            if (!synced && selectedItems.length === 0) {
                const refreshed = await cartApi.getCart().catch(() => null);
                if (!refreshed || !refreshed.items || refreshed.items.length === 0) {
                    throw new Error('No hay productos en tu carrito. Agrega productos antes de realizar el pedido.');
                }
            }

            const fullName = `${personalData.name} ${personalData.apellidoPaterno} ${personalData.apellidoMaterno}`.trim();
            const address = [
                shippingData.avenida,
                shippingData.numero,
                shippingData.pisoLote,
                shippingData.urbanizacion,
                shippingData.distrito,
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

            setOrderResult({
                orderId: response.order_number || `LYR-${Date.now().toString().slice(-6)}`,
                email: personalData.email,
                total: response.total,
                items: selectedItems,
                personalData,
                shippingData,
                orderData,
            });

            // Limpiar carrito del backend
            try { await cartApi.clearCart(); } catch { /* ignorar */ }

            useCheckoutStore.getState().reset();
            setStep(3);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error inesperado al procesar el pedido.';
            setSubmitError(message);
        } finally {
            setProcessing(false);
        }
    };

    return { submitOrder, clearError, submitError, subtotal, total };
}
