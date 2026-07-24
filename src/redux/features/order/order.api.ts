import baseApi from "../../api/api";
import { GetAllOrdersResponse, GetOrderDetailsResponse, SubmitOrderPaymentRequest, SubmitOrderPaymentResponse, UpdateOrderPricingAdjustmentsRequest } from "./order.type";


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
        getOwnerDetailsForReceipt: builder.query({
            query: () => {
                return {
                    url: `/users/owner`,
                    method: "GET"
                };
            }
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
        getPaymentsHistory: builder.query<GetAllOrdersResponse, { page?: number; limit?: number; status?: string; source?: string; date?: string; search?: string } | void>({
            query: (params) => {
                return {
                    url: `/orders/paid-payment`,
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
        deleteOrder: builder.mutation({
            query: (orderId) => {
                return {
                    url: `/orders/${orderId}`,
                    method: "DELETE",
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
            query: ({ orderId, method, cashierId, cashReceived, proofImages, changeAmount }) => {
                const formData = new FormData();

                formData.append("method", method);
                formData.append("cashierId", String(cashierId));
                formData.append("cashReceived", String(cashReceived));
                formData.append("changeAmount", String(changeAmount));

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


        
        // for admin control************************************
        updateOrderPricingAdjustment: builder.mutation<any, { id: number; data: UpdateOrderPricingAdjustmentsRequest }>({
            query: ({ id, data }) => {
                return {
                    url: `/orders/${id}/pricing-adjustments`,
                    method: "PATCH",
                    body: data,
                };
            },
            invalidatesTags: ["orders"]
        }),

    }),
});

export const {
    useGetAllOrdersQuery,
    useGetOrderDetailsQuery,
    useGetOwnerDetailsForReceiptQuery,
    useGetPendingPaymentOrdersQuery,
    useGetPaymentsHistoryQuery,
    useCreateOrderMutation,
    useDeleteOrderMutation,
    useEditOrderMutation,
    useSendOrderToProductionMutation,
    useSubmitOrderPaymentMutation,
    useGetCurrentCustomerOrdersQuery,
    useUpdateOrderPricingAdjustmentMutation
} = orderApi;