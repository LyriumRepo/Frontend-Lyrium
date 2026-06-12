import { create } from 'zustand';

export type DocType = 'DNI' | 'CE' | 'PAS';
export type DeliveryMethod = 'pickup' | 'delivery' | 'service_store' | 'service_home';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'yape_plin' | 'pago_efectivo';

export interface CartItem {
    id: number;
    storeId: number;
    storeName: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    quantity: number;
    selected: boolean;
    service_address?: string | null;
}

export interface PersonalData {
    docType: DocType;
    docNumber: string;
    ceNacionalidad: string;
    ceVencimiento: string;
    ceCalidad: string;
    celularPrefix: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    celular: string;
    celular2: string;
    telefonofijo: string;
    email: string;
    email2: string;
}

export interface ShippingData {
    pais: string;
    departamento: string;
    provincia: string;
    distrito: string;
    urbanizacion: string;
    avenida: string;
    numero: string;
    pisoLote: string;
    referencia: string;
    ciudadPas: string;
    zipCode: string;
    hotelName: string;
    direccionPas: string;
    saveAddress: boolean;
}

export interface OrderData {
    deliveryMethod: DeliveryMethod;
    deliveryCost: number;
    paymentMethod: PaymentMethod;
    promoCode: string;
    discount: number;
    savePayment: boolean;
    selectedPaymentMethodId: number | null;
    liriosUsed: number;
    liriosDiscount: number;
}

export interface OrderResult {
    orderId: string;
    email: string;
    total: number;
    items: CartItem[];
    personalData: PersonalData;
    shippingData: ShippingData;
    orderData: OrderData;
}

interface CheckoutState {
    currentStep: 1 | 2 | 3 | 4;
    isProcessing: boolean;
    cartLoading: boolean;
    cartError: string | null;
    isSubmitting: boolean;
    submitError: string | null;

    cartItems: CartItem[];
    cartLoaded: boolean;
    personalData: PersonalData;
    shippingData: ShippingData;
    orderData: OrderData;
    orderResult: OrderResult | null;

    // Payment
    pendingPaymentOrderId: string | null;
    isPaymentModalOpen: boolean;

    setStep: (step: 1 | 2 | 3 | 4) => void;
    setProcessing: (v: boolean) => void;
    setCartLoading: (v: boolean) => void;
    setCartError: (v: string | null) => void;
    setIsSubmitting: (v: boolean) => void;
    setSubmitError: (v: string | null) => void;
    setCartItems: (items: CartItem[]) => void;
    setCartLoaded: (v: boolean) => void;
    toggleSelectItem: (id: number) => void;
    toggleSelectAll: (selected: boolean) => void;
    setPersonalData: (data: Partial<PersonalData>) => void;
    setShippingData: (data: Partial<ShippingData>) => void;
    setOrderData: (data: Partial<OrderData>) => void;
    setOrderResult: (result: OrderResult) => void;
    setPendingPayment: (orderId: string | null) => void;
    setPaymentModalOpen: (open: boolean) => void;
    reset: () => void;
}

const defaultPersonal: PersonalData = {
    docType: 'DNI', docNumber: '',
    ceNacionalidad: '', ceVencimiento: '', ceCalidad: 'TRABAJADOR',
    celularPrefix: '+51',
    name: '', apellidoPaterno: '', apellidoMaterno: '',
    celular: '', celular2: '', telefonofijo: '',
    email: '', email2: '',
};

const defaultShipping: ShippingData = {
    pais: 'Perú',
    departamento: '', provincia: '', distrito: '',
    urbanizacion: '', avenida: '', numero: '', pisoLote: '', referencia: '',
    ciudadPas: '', zipCode: '', hotelName: '', direccionPas: '',
    saveAddress: false,
};

const defaultOrder: OrderData = {
    deliveryMethod: 'delivery',
    deliveryCost: 10,
    paymentMethod: 'credit_card',
    promoCode: '',
    discount: 0,
    savePayment: false,
    selectedPaymentMethodId: null,
    liriosUsed: 0,
    liriosDiscount: 0,
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
    currentStep: 1,
    isProcessing: false,
    cartLoading: false,
    cartError: null,
    isSubmitting: false,
    submitError: null,
    cartItems: [],
    cartLoaded: false,
    personalData: defaultPersonal,
    shippingData: defaultShipping,
    orderData: defaultOrder,
    orderResult: null,
    pendingPaymentOrderId: null,
    isPaymentModalOpen: false,

    setStep: (step) => set({ currentStep: step }),
    setProcessing: (v) => set({ isProcessing: v }),
    setCartLoading: (v) => set({ cartLoading: v }),
    setCartError: (v) => set({ cartError: v }),
    setIsSubmitting: (v) => set({ isSubmitting: v }),
    setSubmitError: (v) => set({ submitError: v }),
    setCartItems: (items) => set({ cartItems: items }),
    setCartLoaded: (v) => set({ cartLoaded: v }),
    toggleSelectItem: (id) =>
        set((s) => ({
            cartItems: s.cartItems.map((i) =>
                i.id === id ? { ...i, selected: !i.selected } : i
            ),
        })),
    toggleSelectAll: (selected) =>
        set((s) => ({ cartItems: s.cartItems.map((i) => ({ ...i, selected })) })),
    setPersonalData: (data) =>
        set((s) => ({ personalData: { ...s.personalData, ...data } })),
    setShippingData: (data) =>
        set((s) => ({ shippingData: { ...s.shippingData, ...data } })),
    setOrderData: (data) =>
        set((s) => ({ orderData: { ...s.orderData, ...data } })),
    setOrderResult: (result) => set({ orderResult: result }),
    setPendingPayment: (orderId) => set({ pendingPaymentOrderId: orderId, isPaymentModalOpen: orderId !== null }),
    setPaymentModalOpen: (open) => set({ isPaymentModalOpen: open }),
    reset: () =>
        set({
            currentStep: 1,
            cartLoading: false,
            cartError: null,
            isSubmitting: false,
            submitError: null,
            cartItems: [],
            cartLoaded: false,
            personalData: defaultPersonal,
            shippingData: defaultShipping,
            orderData: defaultOrder,
            orderResult: null,
            pendingPaymentOrderId: null,
            isPaymentModalOpen: false,
        }),
}));
