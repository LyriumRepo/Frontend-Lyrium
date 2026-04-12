import { useCheckoutStore } from '@/store/checkoutStore';

/**
 * Hook that handles order submission logic.
 * Simulates an API call and sets the order result on success.
 */
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

    const selectedItems = cartItems.filter((i) => i.selected);
    const subtotal = selectedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const total = subtotal + orderData.deliveryCost - orderData.discount;

    const submitOrder = async () => {
        setProcessing(true);

        try {
            // Simulate API call — replace with real endpoint
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const orderId = `LYR-${Date.now().toString().slice(-6)}`;

            setOrderResult({
                orderId,
                email: personalData.email,
                total,
                items: selectedItems,
                personalData,
                shippingData,
                orderData,
            });

            setStep(3);
        } catch (error) {
            console.error('Error al procesar el pedido:', error);
        } finally {
            setProcessing(false);
        }
    };

    return { submitOrder, subtotal, total };
}
