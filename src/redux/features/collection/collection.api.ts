import baseApi from "../../api/api";
import { GetAllCollectionParams, GetAllCollectionResponse } from "./collection.type";

const collectionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllCollection: builder.query<GetAllCollectionResponse, GetAllCollectionParams | void>({
            query: (params) => {
                return {
                    url: "/orders",
                    method: "GET",
                    params: {
                        date: new Date().toISOString().split("T")[0],
                        ...params,
                    },
                };
            },
            providesTags: ["collection"]
        }),
        pickupOrderCollection: builder.mutation<unknown, number>({
            query: (orderId) => {
                return {
                    url: `/orders/${orderId}/pickup`,
                    method: "PATCH"
                };
            },
            invalidatesTags: ["collection", "productions"]
        }),
    }),
});

export const {
    useGetAllCollectionQuery,
    usePickupOrderCollectionMutation,
} = collectionApi;

export default collectionApi;