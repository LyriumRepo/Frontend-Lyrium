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
    currentStep: 1 | 2 | 3;
    isProcessing: boolean;

    cartItems: CartItem[];
    personalData: PersonalData;
    shippingData: ShippingData;
    orderData: OrderData;
    orderResult: OrderResult | null;

    setStep: (step: 1 | 2 | 3) => void;
    setProcessing: (v: boolean) => void;
    setCartItems: (items: CartItem[]) => void;
    toggleSelectItem: (id: number) => void;
    toggleSelectAll: (selected: boolean) => void;
    setPersonalData: (data: Partial<PersonalData>) => void;
    setShippingData: (data: Partial<ShippingData>) => void;
    setOrderData: (data: Partial<OrderData>) => void;
    setOrderResult: (result: OrderResult) => void;
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
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
    currentStep: 1,
    isProcessing: false,
    cartItems: [],
    personalData: defaultPersonal,
    shippingData: defaultShipping,
    orderData: defaultOrder,
    orderResult: null,

    setStep: (step) => set({ currentStep: step }),
    setProcessing: (v) => set({ isProcessing: v }),
    setCartItems: (items) => set({ cartItems: items }),
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
    reset: () =>
        set({
            currentStep: 1,
            cartItems: [],
            personalData: defaultPersonal,
            shippingData: defaultShipping,
            orderData: defaultOrder,
            orderResult: null,
        }),
}));
