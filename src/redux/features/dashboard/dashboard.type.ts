export interface TopSellingItem {
    id: number;
    name: string;
    totalSold: number;
    totalRevenue: number;
}

export interface OverviewStats {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    percentageChange: number;
}

export interface OrderTypeBreakdown {
    type: string;
    count: number;
    percentage: number;
}

export interface SalesOverTime {
    date: string;
    revenue: number;
    orders: number;
}

export interface OrdersPerHour {
    hour: number;
    count: number;
}

export interface AnalyticsData {
    topSellingItems: TopSellingItem[];
    overview: OverviewStats;
    orderTypeBreakdown: OrderTypeBreakdown[];
    salesOverTime: SalesOverTime[];
    ordersPerHour: OrdersPerHour[];
}

export interface AnalyticsResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: AnalyticsData;
}

export interface AnalyticsQueryParams {
    startDate?: string;
    endDate?: string;
}

// Sales Report Interfaces
export interface SalesReportPeriod {
    startDate: string;
    endDate: string;
}

export interface SalesReportSummary {
    date: string;
    revenue: number;
    orders: number;
}

export interface MonthlyEarnings {
    currentMonth: number;
    previousMonth: number;
    percentageChange: number;
    comparisonText: string;
}

export interface SalesReportTopItem {
    item: string;
    category: string;
    quantity: number;
    revenue: number;
}

export interface SalesReportOrderBreakdown {
    dineIn: number;
    takeaway: number;
    dineInPercentage: number;
    takeawayPercentage: number;
}

export interface ProductionPerformance {
    itemName: string;
    avgPrepTime: number;
}

export interface SalesReportData {
    period: SalesReportPeriod;
    salesSummary: SalesReportSummary[];
    monthlyEarnings: MonthlyEarnings;
    topSellingItems: SalesReportTopItem[];
    orderBreakdown: SalesReportOrderBreakdown;
    productionPerformance: ProductionPerformance[];
}

export interface SalesReportResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: SalesReportData;
}

// Payments Interfaces
export interface PaymentOrder {
    id: number;
    slug: string;
    customerName: string;
}

export interface PaymentItem {
    id: number;
    slug: string;
    orderId: number;
    method: "CASH" | "TRANSFER" | "OTHER";
    status: "PENDING" | "PAID" | "CANCELLED";
    subtotal: string;
    chargesTotal: string;
    totalAmount: string;
    cashReceived: number | null;
    changeAmount: number | null;
    proofImages: string[];
    appliedCharges: any;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    order: PaymentOrder;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface GetPaymentsResponse {
    success: boolean;
    statusCode: number;
    message: string;
    pagination: Pagination;
    data: PaymentItem[];
}

export interface GetPaymentsQueryParams {
    page?: number;
    limit?: number;
    status?: "PENDING" | "PAID" | "CANCELLED" | "";
    method?: "CASH" | "TRANSFER" | "OTHER" | "";
    search?: string;
}

export interface PaymentDetailsOrderItem {
    id: string;
    itemName: string;
    quantity: number;
    unitPrice: string;
}

export interface PaymentDetailsOrder {
    id: number;
    slug: string;
    customerName: string;
    type: "DINE_IN" | "TAKE_AWAY" | string;
    totalAmount: string;
    orderItems: PaymentDetailsOrderItem[];
}

export interface PaymentDetails {
    id: number;
    slug: string;
    orderId: number;
    method: "CASH" | "TRANSFER" | "OTHER";
    status: "PENDING" | "PAID" | "CANCELLED";
    subtotal: number;
    chargesTotal: number;
    totalAmount: number;
    cashReceived: number | null;
    changeAmount: number | null;
    proofImages: string[];
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    order: PaymentDetailsOrder;
}

export interface GetPaymentDetailsResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: PaymentDetails;
}

// Inventory Interfaces
export interface InventoryItem {
    id: number;
    slug: string;
    name: string;
    inventoryQty: number | null;
    price: string;
    imageUrl: string | null;
    isOutOfStock: boolean;
}

export interface GetInventoryReportResponse {
    success: boolean;
    statusCode: number;
    message: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    data: InventoryItem[];
}

export interface GetInventoryReportQueryParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface GetItemsItem {
    id: number;
    slug: string;
    name: string;
    itemType: string;
    price: string;
    productionStationId: number;
    inventoryQty: number | null;
    labels: string[];
    imageUrl: string | null;
    isVisible: boolean;
    isOutOfStock: boolean;
    hasPromo: boolean;
    promoName: string | null;
    promoPrice: string | null;
    maxPacketItems: number;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface GetItemsResponse {
    success: boolean;
    statusCode: number;
    message: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    data: GetItemsItem[];
}

export interface GetItemsQueryParams {
    limit?: number;
    search?: string;
}

export interface StockAdjustBody {
    itemId: number;
    qty: number;
    remarks?: string;
}

export interface StockAdjustResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: null;
}

