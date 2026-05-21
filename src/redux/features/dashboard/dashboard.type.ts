/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface UserListItem {
    id: number;
    slug: string;
    name: string | null;
    role: "OWNER" | "ADMIN" | "SERVICE" | "USER" | string;
    email: string | null;
    phone: string | null;
    photoUrl: string | null;
    address: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetAllUsersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface AddUserBody {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "OWNER" | "ADMIN" | "SERVICE" | "USER";
    address: string;
    facebookUrl?: string;
    instagramUrl?: string;
}

export interface AddUserResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: UserListItem;
}

export interface GetUserByIdResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: UserListItem;
}

export interface ChangeUserPasswordBody {
    password: string;
}

export interface ChangeUserPasswordResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: null;
}

export interface DeleteUserResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: UserListItem;
}

export interface OperatingHoursData {
    id: number;
    sundayStart: string;
    sundayEnd: string;
    mondayStart: string;
    mondayEnd: string;
    tuesdayStart: string;
    tuesdayEnd: string;
    wednesdayStart: string;
    wednesdayEnd: string;
    thursdayStart: string;
    thursdayEnd: string;
    fridayStart: string;
    fridayEnd: string;
    saturdayStart: string;
    saturdayEnd: string;
}

export interface GetOperatingHoursResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: OperatingHoursData;
}

export interface UpdateOperatingHoursBody {
    sundayStart: string;
    sundayEnd: string;
    mondayStart: string;
    mondayEnd: string;
    tuesdayStart: string;
    tuesdayEnd: string;
    wednesdayStart: string;
    wednesdayEnd: string;
    thursdayStart: string;
    thursdayEnd: string;
    fridayStart: string;
    fridayEnd: string;
    saturdayStart: string;
    saturdayEnd: string;
}

export interface UpdateOperatingHoursResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: OperatingHoursData;
}

export interface GetAllUsersResponse {
    success: boolean;
    statusCode: number;
    message: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    data: UserListItem[];
}

export interface InventoryLogItem {
    id: number;
    slug: string | null;
    itemId: number;
    itemName: string;
    date: string;
    openingStock: number;
    stockSold: number;
    stockIn: number;
    stockOut: number;
    closingStock: number;
    remarks: string | null;
    createdBy: any;
    createdAt: string;
}

export interface GetInventoryLogsResponse {
    success: boolean;
    statusCode: number;
    message: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    data: InventoryLogItem[];
}

export interface GetInventoryLogsQueryParams {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}


