import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type DocType        = 'DNI' | 'CE' | 'PAS';
export type DeliveryMethod = 'pickup' | 'delivery' | 'service_store' | 'service_home';
export type PaymentMethod  = 'credit_card' | 'debit_card' | 'yape_plin' | 'pago_efectivo';
export type TipoEntrega    = 'domicilio' | 'agencia';

export interface CajaDetalle {
  tipo:            string;
  largo:           number;
  ancho:           number;
  alto:            number;
  pesoReal:        number;
  pesoVolumetrico: number;
  pesoFacturable:  number;
}

export interface TiendaBoxResult {
  store_id:   number;
  store_name: string;
  store_slug?: string;
  origen: {
    departamento: string;
    provincia:    string;
    distrito:     string;
  };
  productos: Array<{
    nombre:   string;
    cantidad: number;
    peso:     number;
    precio:   number;
  }>;
  caja?:       string;
  cajas?:      CajaDetalle[];
  eficiencia?: number;
  error?:      string;
}

export interface CourierOption {
  courier:   string;
  precio?:   number;
  domicilio?: { disponible: boolean; precio: number; label?: string; detalle?: string };
  agencia?:   { disponible: boolean; precio: number; label?: string; detalle?: string };
  tiempo?:    string;
  agenciaOrigen?:  { nombre: string; zona: string; direccion?: string; display: string };
  agenciaDestino?: { nombre: string; zona: string; direccion?: string; display: string };
}

export interface TiendaLogistica {
  tiendaId:    number;
  tienda:      string;
  tiendaSlug?: string;
  origen: {
    departamento: string;
    provincia:    string;
    distrito:     string;
    display:      string;
  };
  productos: {
    cantidad: number;
    items:    Array<{ nombre: string; cantidad: number; peso: number; precio: number }>;
  };
  cajas: {
    resumen:    string;
    cantidad:   number;
    eficiencia: number;
    detalle:    CajaDetalle[];
  };
  logistica: {
    esLocal:             boolean;
    couriersDisponibles: string[];
    opciones:            CourierOption[];
    soportaDomicilio:    boolean;
    soportaAgencia:      boolean;
  };
  error?: string;
}
export interface LaravelCalcResponse {
  success:     boolean;
  destino: {
    departamento: string;
    provincia:    string;
    distrito:     string;
    display:      string;
  };
  tipoEntrega: string;
  tiendas:     TiendaLogistica[];
  resumen: {
    totalTiendas:   number;
    totalProductos: number;
    totalOpciones:  number;
    hayLocal:       boolean;
  };
}

export type ScraperCalcResponse = LaravelCalcResponse;
export type VendedorLogistica   = TiendaLogistica;

export interface CartItem {
  id:            number;
  storeId:       number;
  storeName:     string;
  storeSlug?:    string;
  name:          string;
  image:         string;
  price:         number;
  originalPrice: number;
  quantity:      number;
  selected:      boolean;
  service_address?: string | null;
  peso?:  number;
  largo?: number;
  ancho?: number;
  alto?:  number;
  origen?: {
    departamento: string;
    provincia:    string;
    distrito:     string;
  };
}

export interface PersonalData {
  docType:         DocType;
  docNumber:       string;
  ceNacionalidad:  string;
  ceVencimiento:   string;
  ceCalidad:       string;
  celularPrefix:   string;
  name:            string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  celular:         string;
  celular2:        string;
  telefonofijo:    string;
  email:           string;
  email2:          string;
}

export interface ShippingData {
  pais:         string;
  departamento: string;
  provincia:    string;
  distrito:     string;
  urbanizacion: string;
  avenida:      string;
  numero:       string;
  pisoLote:     string;
  referencia:   string;
  ciudadPas:    string;
  zipCode:      string;
  hotelName:    string;
  direccionPas: string;
  saveAddress:  boolean;
}

export interface OrderData {
  deliveryMethod:          DeliveryMethod;
  deliveryCost:            number;
  paymentMethod:           PaymentMethod;
  promoCode:               string;
  discount:                number;
  savePayment:             boolean;
  selectedPaymentMethodId: number | null;
  liriosUsed:              number;
  liriosDiscount:          number;
  selectedBranchId:        number | null;
}

export interface OrderResult {
  orderId:          string;
  email:            string;
  total:            number;
  shipping?:        number;
  backendSubtotal?: number;
  backendShipping?: number;
  items:            CartItem[];
  personalData:     PersonalData;
  shippingData:     ShippingData;
  orderData:        OrderData;
}

interface CheckoutState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  isProcessing: boolean;
  cartLoading:  boolean;
  cartError:    string | null;
  isSubmitting: boolean;
  submitError:  string | null;

  cartItems:    CartItem[];
  cartLoaded:   boolean;
  personalData: PersonalData;
  shippingData: ShippingData;
  orderData:    OrderData;
  orderResult:  OrderResult | null;

  // Payment
  pendingPaymentOrderId: string | null;
  isPaymentModalOpen:    boolean;

  boxCalculation: TiendaBoxResult[] | null;
  isLoadingBox:   boolean;
  boxError:       string | null;

  shippingQuotes:      LaravelCalcResponse | null;
  selectedCourier:     string | null;
  selectedTipoEntrega: TipoEntrega;
  isLoadingQuotes:     boolean;
  quotesError:         string | null;

  setStep:             (step: 1 | 2 | 3 | 4 | 5) => void;
  setProcessing:       (v: boolean) => void;
  setCartLoading:      (v: boolean) => void;
  setCartError:        (v: string | null) => void;
  setIsSubmitting:     (v: boolean) => void;
  setSubmitError:      (v: string | null) => void;
  setCartItems:        (items: CartItem[]) => void;
  setCartLoaded:       (v: boolean) => void;
  toggleSelectItem:    (id: number) => void;
  toggleSelectAll:     (selected: boolean) => void;
  setPersonalData:     (data: Partial<PersonalData>) => void;
  setShippingData:     (data: Partial<ShippingData>) => void;
  setOrderData:        (data: Partial<OrderData>) => void;
  setOrderResult:      (result: OrderResult) => void;
  setPendingPayment:   (orderId: string | null) => void;
  setPaymentModalOpen: (open: boolean) => void;
  reset:               () => void;

  setBoxCalculation:   (data: TiendaBoxResult[] | null) => void;
  setLoadingBox:       (v: boolean) => void;
  setBoxError:         (e: string | null) => void;

  setShippingQuotes:      (q: LaravelCalcResponse | null) => void;
  setSelectedCourier:     (c: string | null) => void;
  setSelectedTipoEntrega: (t: TipoEntrega) => void;
  setLoadingQuotes:       (v: boolean) => void;
  setQuotesError:         (e: string | null) => void;
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
  deliveryMethod:          'delivery',
  deliveryCost:            10,
  paymentMethod:           'credit_card',
  promoCode:               '',
  discount:                0,
  savePayment:             false,
  selectedPaymentMethodId: null,
  liriosUsed:              0,
  liriosDiscount:          0,
  selectedBranchId:        null,
};

export const useCheckoutStore = create<CheckoutState>()(persist((set) => ({
  currentStep:  1,
  isProcessing: false,
  cartLoading:  false,
  cartError:    null,
  isSubmitting: false,
  submitError:  null,
  cartItems:    [],
  cartLoaded:   false,
  personalData: defaultPersonal,
  shippingData: defaultShipping,
  orderData:    defaultOrder,
  orderResult:  null,
  pendingPaymentOrderId: null,
  isPaymentModalOpen:    false,

  boxCalculation: null,
  isLoadingBox:   false,
  boxError:       null,

  shippingQuotes:      null,
  selectedCourier:     null,
  selectedTipoEntrega: 'domicilio',
  isLoadingQuotes:     false,
  quotesError:         null,

  setStep:          (step) => set({ currentStep: step }),
  setProcessing:    (v)    => set({ isProcessing: v }),
  setCartLoading:   (v)    => set({ cartLoading: v }),
  setCartError:     (v)    => set({ cartError: v }),
  setIsSubmitting:  (v)    => set({ isSubmitting: v }),
  setSubmitError:   (v)    => set({ submitError: v }),
  setCartItems:     (items) => set({ cartItems: items }),
  setCartLoaded:    (v)    => set({ cartLoaded: v }),
  toggleSelectItem: (id)   =>
    set((s) => ({ cartItems: s.cartItems.map((i) => i.id === id ? { ...i, selected: !i.selected } : i) })),
  toggleSelectAll: (selected) =>
    set((s) => ({ cartItems: s.cartItems.map((i) => ({ ...i, selected })) })),
  setPersonalData: (data) => set((s) => ({ personalData: { ...s.personalData, ...data } })),
  setShippingData: (data) => set((s) => ({ shippingData: { ...s.shippingData, ...data } })),
  setOrderData:    (data) => set((s) => ({ orderData:    { ...s.orderData, ...data } })),
  setOrderResult:  (result) => set({ orderResult: result }),
  setPendingPayment:   (orderId) => set({ pendingPaymentOrderId: orderId, isPaymentModalOpen: orderId !== null }),
  setPaymentModalOpen: (open)    => set({ isPaymentModalOpen: open }),

  reset: () => set({
    currentStep:  1,
    cartLoading:  false,
    cartError:    null,
    isSubmitting: false,
    submitError:  null,
    cartItems:    [],
    cartLoaded:   false,
    personalData: defaultPersonal,
    shippingData: defaultShipping,
    orderData:    defaultOrder,
    orderResult:  null,
    pendingPaymentOrderId: null,
    isPaymentModalOpen:    false,
    boxCalculation: null,
    isLoadingBox:   false,
    boxError:       null,
    shippingQuotes:      null,
    selectedCourier:     null,
    selectedTipoEntrega: 'domicilio',
    isLoadingQuotes:     false,
    quotesError:         null,
  }),

  setBoxCalculation:   (data) => set({ boxCalculation: data }),
  setLoadingBox:       (v)    => set({ isLoadingBox: v }),
  setBoxError:         (e)    => set({ boxError: e }),

  setShippingQuotes:      (q) => set({ shippingQuotes: q }),
  setSelectedCourier:     (c) => set({ selectedCourier: c }),
  setSelectedTipoEntrega: (t) => set({ selectedTipoEntrega: t }),
  setLoadingQuotes:       (v) => set({ isLoadingQuotes: v }),
  setQuotesError:         (e) => set({ quotesError: e }),
}),
{
  name: 'lyrium-checkout-draft',
  storage: createJSONStorage(() => localStorage),
  // Solo persistimos lo que el usuario escribió a mano — no carrito (viene del
  // servidor), ni flags de carga/error, ni resultado de orden/pago (evita
  // reabrir un modal de pago o "revivir" una orden ya procesada).
  partialize: (state) => ({
    currentStep: state.currentStep,
    personalData: state.personalData,
    shippingData: state.shippingData,
    orderData: state.orderData,
    selectedCourier: state.selectedCourier,
    selectedTipoEntrega: state.selectedTipoEntrega,
  }),
}));
