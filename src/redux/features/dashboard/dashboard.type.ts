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
