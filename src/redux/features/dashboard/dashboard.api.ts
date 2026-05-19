import baseApi from "../../api/api";
import {
    AnalyticsQueryParams,
    AnalyticsResponse,
    SalesReportResponse,
    GetPaymentsResponse,
    GetPaymentsQueryParams,
    GetPaymentDetailsResponse,
    GetInventoryReportResponse,
    GetInventoryReportQueryParams,
    GetItemsResponse,
    GetItemsQueryParams,
    StockAdjustBody,
    StockAdjustResponse
} from "./dashboard.type";

const dashboardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAnalytics: builder.query<AnalyticsResponse, AnalyticsQueryParams | void>({
            query: (params) => {
                const queryParams: Record<string, string> = {};
                if (params?.startDate) queryParams.startDate = params.startDate;
                if (params?.endDate) queryParams.endDate = params.endDate;

                return {
                    url: "/analytics",
                    method: "GET",
                    params: queryParams,
                };
            },
        }),
        getSalesReports: builder.query<SalesReportResponse, AnalyticsQueryParams | void>({
            query: (params) => {
                const queryParams: Record<string, string> = {};
                if (params?.startDate) queryParams.startDate = params.startDate;
                if (params?.endDate) queryParams.endDate = params.endDate;

                return {
                    url: "/analytics/sales-report",
                    method: "GET",
                    params: queryParams,
                };
            },
        }),
        getPayments: builder.query<GetPaymentsResponse, GetPaymentsQueryParams | void>({
            query: (params) => {
                const queryParams: Record<string, string> = {};
                if (params?.page) queryParams.page = String(params.page);
                if (params?.limit) queryParams.limit = String(params.limit);
                if (params?.status) queryParams.status = params.status;
                if (params?.method) queryParams.method = params.method;
                if (params?.search) queryParams.search = params.search;

                return {
                    url: "/payments",
                    method: "GET",
                    params: queryParams,
                };
            },
        }),
        getPaymentDetails: builder.query<GetPaymentDetailsResponse, number>({
            query: (id) => {
                return {
                    url: `/payments/${id}`,
                    method: "GET",
                };
            },
        }),

        // inventoryReport*******************************************************************

        getInventoryReport: builder.query<GetInventoryReportResponse, GetInventoryReportQueryParams | void>({
            query: (params) => {
                const queryParams: Record<string, string> = {};
                if (params?.page) queryParams.page = String(params.page);
                if (params?.limit) queryParams.limit = String(params.limit);
                if (params?.search) queryParams.search = params.search;

                return {
                    url: `/inventory`,
                    method: "GET",
                    params: queryParams
                };
            },
        }),
        getItems: builder.query<GetItemsResponse, GetItemsQueryParams | void>({
            query: (params) => {
                const queryParams: Record<string, string> = {};
                if (params?.limit) queryParams.limit = String(params.limit);
                if (params?.search) queryParams.search = params.search;

                return {
                    url: `/items`,
                    method: "GET",
                    params: queryParams,
                };
            },
        }),
        stockIn: builder.mutation<StockAdjustResponse, StockAdjustBody>({
            query: (data) => {
                return {
                    url: `/inventory/stock-in`,
                    method: "POST",
                    body: data
                };
            },
        }),
        stockOut: builder.mutation<StockAdjustResponse, StockAdjustBody>({
            query: (data) => {
                return {
                    url: `/inventory/stock-out`,
                    method: "POST",
                    body: data
                };
            },
        }),
    }),
});

export const {
    useGetAnalyticsQuery,
    useGetSalesReportsQuery,
    useGetPaymentsQuery,
    useGetPaymentDetailsQuery,
    useGetInventoryReportQuery,
    useGetItemsQuery,
    useStockInMutation,
    useStockOutMutation,
} = dashboardApi;