export interface TransactionCustomer {
  id: string;
  name: string;
  email: string;
}

export interface TransactionStore {
  id: string;
  name: string;
  slug: string;
}

export interface TransactionItemProduct {
  id: string;
  name: string;
  slug: string;
}

export interface TransactionItem {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  commissionRate: number;
  commissionAmount: number;
  productType: string | null;
  store: TransactionStore;
  product: TransactionItemProduct | null;
}

export interface Transaction {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: TransactionCustomer | null;
  stores: TransactionStore[];
  items: TransactionItem[];
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  tipo: string;
  commissionAmount: number;
  commissionIgv: number;
  commissionTotal: number;
  paymentMethod: string | null;
  paymentStatus: string;
  cardBrand: string | null;
  cardLast4: string | null;
  transactionStatus: string | null;
  transactionUuid: string | null;
  izipayOrderId: string | null;
  mode: string | null;
}

export interface TransactionPagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface TransactionListResponse {
  data: Transaction[];
  pagination: TransactionPagination;
}

export interface TransactionStats {
  totalTransactions: number;
  successful: number;
  failed: number;
  totalAmount: number;
  successRate: number;
}

export interface TransactionStatsResponse {
  today: TransactionStats;
  thisWeek: TransactionStats;
  thisMonth: TransactionStats;
  overall: TransactionStats;
  methodDistribution: Array<{
    method: string;
    count: number;
    totalInCents: number;
  }>;
}

export interface TransactionFilters {
  search?: string;
  date_from?: string;
  date_to?: string;
  payment_status?: string;
  transaction_status?: string;
  payment_method?: string;
  store_id?: string;
  page?: number;
  per_page?: number;
}
