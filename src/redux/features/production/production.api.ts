import baseApi from "../../api/api";
import { GetAllProductionsParams, GetAllProductionsResponse } from "./production.type";


const productionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllProductions: builder.query<GetAllProductionsResponse, GetAllProductionsParams | void>({
            query: (params) => {
                return {
                    url: "/orders/production",
                    method: "GET",
                    params: params || undefined
                };
            },
            providesTags: ["productions"]
        }),
        acceptOrder: builder.mutation<unknown, number>({
            query: (orderId) => {
                return {
                    url: `/orders/${orderId}/accept`,
                    method: "PATCH"
                };
            },
            invalidatesTags: ["productions"]
        }),
        cancelOrder: builder.mutation<unknown, number>({
            query: (orderId) => {
                return {
                    url: `/orders/${orderId}/cancel`,
                    method: "PATCH"
                };
            },
            invalidatesTags: ["productions"]
        }),
        readyOrder: builder.mutation<unknown, number>({
            query: (orderId) => {
                return {
                    url: `/orders/${orderId}/ready`,
                    method: "PATCH"
                };
            },
            invalidatesTags: ["productions"]
        }),
        pickupOrder: builder.mutation<unknown, number>({
            query: (orderId) => {
                return {
                    url: `/orders/${orderId}/pickup`,
                    method: "PATCH"
                };
            },
            invalidatesTags: ["productions"]
        }),
    }),
});

export const {
    useGetAllProductionsQuery,
    useAcceptOrderMutation,
    useCancelOrderMutation,
    useReadyOrderMutation,
    usePickupOrderMutation
} = productionApi;