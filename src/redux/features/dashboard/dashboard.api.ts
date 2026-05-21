import baseApi from "../../api/api";
import {
    ChangeUserPasswordBody,
    ChangeUserPasswordResponse,
    AddUserBody,
    AddUserResponse,
    AnalyticsQueryParams,
    AnalyticsResponse,
    DeleteUserResponse,
    GetAllUsersQueryParams,
    GetAllUsersResponse,
    GetInventoryReportQueryParams,
    GetInventoryReportResponse,
    GetItemsQueryParams,
    GetItemsResponse,
    GetPaymentDetailsResponse,
    GetPaymentsQueryParams,
    GetPaymentsResponse,
    GetUserByIdResponse,
    GetOperatingHoursResponse,
    SalesReportResponse,
    StockAdjustBody,
    StockAdjustResponse,
    UpdateOperatingHoursBody,
    UpdateOperatingHoursResponse,
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


        // users**************************************************
        getAllUsers: builder.query<GetAllUsersResponse, GetAllUsersQueryParams | void>({
            query: (params) => {
                const queryParams: Record<string, string> = {};
                if (params?.page) queryParams.page = String(params.page);
                if (params?.limit) queryParams.limit = String(params.limit);
                if (params?.search) queryParams.search = params.search;

                return {
                    url: "/users",
                    method: "GET",
                    params: queryParams,
                };
            },
            providesTags: ["users"]
        }),
        getUserById: builder.query<GetUserByIdResponse, number>({
            query: (userId) => {
                return {
                    url: `/users/${userId}`,
                    method: "GET"
                };
            },
            providesTags: ["users"]
        }),
        addUser: builder.mutation<AddUserResponse, AddUserBody>({
            query: (data) => {
                return {
                    url: `/users`,
                    method: "POST",
                    body: data
                };
            },
            invalidatesTags: ["users"],
        }),
        changeUserPassword: builder.mutation<ChangeUserPasswordResponse, { userId: number; data: ChangeUserPasswordBody }>({
            query: ({ userId, data }) => {
                return {
                    url: `/users/${userId}/change-password`,
                    method: "PATCH",
                    body: data
                };
            },
            invalidatesTags: ["users"],
        }),
        deleteUser: builder.mutation<DeleteUserResponse, number>({
            query: (userId) => {
                return {
                    url: `/users/${userId}`,
                    method: "DELETE"
                };
            },
            invalidatesTags: ["users"],
        }),
        getOperatingHours: builder.query<GetOperatingHoursResponse, void>({
            query: () => {
                return {
                    url: `/operating-hours`,
                    method: "GET"
                };
            },
            providesTags: ["operating-hours"]
        }),
        updateOperatingHours: builder.mutation<UpdateOperatingHoursResponse, UpdateOperatingHoursBody>({
            query: (data) => {
                return {
                    url: `/operating-hours`,
                    method: "PATCH",
                    body: data
                };
            },
            invalidatesTags: ["operating-hours"]
        }),
        updateUser: builder.mutation({
            query: ({ userId, data }) => {
                return {
                    url: `/users/${userId}`,
                    method: "PATCH",
                    body: data
                };
            },
            invalidatesTags: ["users"]
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
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useAddUserMutation,
    useChangeUserPasswordMutation,
    useDeleteUserMutation,
    useGetOperatingHoursQuery,
    useUpdateOperatingHoursMutation,
    useUpdateUserMutation,
} = dashboardApi;