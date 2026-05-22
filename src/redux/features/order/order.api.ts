import baseApi from "../../api/api";



const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllOrders: builder.query({
            query: (params) => {
                return {
                    url: "/orders",
                    method: "GET",
                    params
                };
            },
            providesTags: ["orders"]
        }),
        getOrderDetails: builder.query({
            query: (id) => {
                return {
                    url: `/orders/${id}`,
                    method: "GET"
                };
            },
            providesTags: ["orders"]
        }),
        getPendingPaymentOrders: builder.query({
            query: () => {
                return {
                    url: `/orders/pending-payment`,
                    method: "GET"
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