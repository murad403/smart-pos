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
