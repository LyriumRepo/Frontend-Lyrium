import { Order, OrderStatus } from '@/features/seller/sales/types';

export interface OrderFilters {
    status?: OrderStatus;
    dateStart?: string;
    dateEnd?: string;
    search?: string;
}

export interface CreateOrderInput {
    customerId: string;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    shippingAddress: string;
    paymentMethod: string;
}

export interface UpdateOrderInput {
    status?: OrderStatus;
    tracking?: string;
    notes?: string;
    carrier_code?: string;
    carrier_data?: Record<string, string>;
}

export interface IOrderRepository {
    getOrders(filters?: OrderFilters): Promise<Order[]>;
    getOrderById(id: string): Promise<Order | null>;
    createOrder(input: CreateOrderInput): Promise<Order>;
    updateOrder(id: string, input: UpdateOrderInput): Promise<Order>;
    confirmOrder(id: string): Promise<Order>;
    deleteOrder(id: string): Promise<boolean>;
    advanceOrderStep(id: string, section?: 'products' | 'services' | 'confirm'): Promise<Order>;
    confirmItem(orderId: string, itemId: string): Promise<Order>;
    updateItemStatus(orderId: string, itemId: string, status: OrderStatus): Promise<Order>;
    cancelItem(orderId: string, itemId: string): Promise<Order>;
    getDashboardStats(): Promise<{ monthlySales: number; todayOrders: number }>;
}
