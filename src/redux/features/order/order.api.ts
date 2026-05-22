import baseApi from "../../api/api";
import { GetAllOrdersResponse, GetOrderDetailsResponse } from "./order.type";

const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllOrders: builder.query<GetAllOrdersResponse, { page?: number; limit?: number; status?: string; source?: string; date?: string; search?: string } | void>({
            query: (params) => {
                return {
                    url: "/orders",
                    method: "GET",
                    params: params || undefined
                };
            },
            providesTags: ["orders"]
        }),
        getOrderDetails: builder.query<GetOrderDetailsResponse, number>({
            query: (id) => {
                return {
                    url: `/orders/${id}`,
                    method: "GET"
                };
            },
            providesTags: ["orders"]
        }),
        getPendingPaymentOrders: builder.query<GetAllOrdersResponse, { page?: number; limit?: number } | void>({
            query: (params) => {
                return {
                    url: `/orders/pending-payment`,
                    method: "GET",
                    params: params || undefined
                };
            },
            providesTags: ["orders"]
        })
    }),
});

export const {
    useGetAllOrdersQuery,
    useGetOrderDetailsQuery,
    useGetPendingPaymentOrdersQuery,
} = orderApi;