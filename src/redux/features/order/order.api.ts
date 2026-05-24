import baseApi from "../../api/api";
import { GetAllOrdersResponse, GetOrderDetailsResponse, SubmitOrderPaymentRequest, SubmitOrderPaymentResponse } from "./order.type";


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
        getOrderDetails: builder.query<GetOrderDetailsResponse, number | null>({
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
        }),
        createOrder: builder.mutation({
            query: (data) => {
                return {
                    url: `/orders`,
                    method: "POST",
                    body: data
                };
            },
            invalidatesTags: ["orders"]
        }),
        editOrder: builder.mutation({
            query: ({ data, orderId }) => {
                return {
                    url: `/orders/${orderId}`,
                    method: "PATCH",
                    body: data
                };
            },
            invalidatesTags: ["orders"]
        }),
        sendOrderToProduction: builder.mutation({
            query: (orderId) => {
                return {
                    url: `/orders/${orderId}/send-to-production`,
                    method: "POST"
                };
            },
            invalidatesTags: ["orders"]
        }),
        submitOrderPayment: builder.mutation<SubmitOrderPaymentResponse, SubmitOrderPaymentRequest>({
            query: ({ orderId, method, proofImages }) => {
                const formData = new FormData();

                formData.append("method", method);

                proofImages?.forEach((proofImage) => {
                    formData.append("proofImages", proofImage);
                });

                return {
                    url: `/orders/${orderId}/payment`,
                    method: "POST",
                    body: formData
                };
            },
            invalidatesTags: ["orders"]
        }),

        // current customer order*********************
        getCurrentCustomerOrders: builder.query<GetAllOrdersResponse, number | string | null | undefined>({
            query: (userId) => {
                return {
                    url: `/orders/active?page=1&limit=100&userId=${userId}`,
                    method: "GET"
                };
            },
            providesTags: ["orders"]
        }),
    }),
});

export const {
    useGetAllOrdersQuery,
    useGetOrderDetailsQuery,
    useGetPendingPaymentOrdersQuery,
    useCreateOrderMutation,
    useEditOrderMutation,
    useSendOrderToProductionMutation,
    useSubmitOrderPaymentMutation,
    useGetCurrentCustomerOrdersQuery
} = orderApi;