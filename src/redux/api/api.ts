import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// base query-----------------------------------------------------------------------------------------------
const baseQuery = fetchBaseQuery({
     baseUrl: process.env.NEXT_PUBLIC_BASE_URL
})


const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: baseQuery,
    tagTypes: ["menu", "section", "users", "item", "production-station", "operating-hours", "tables", "shift-workflow", "orders", "productions", "collection", "price-adjustment", "business-information"],
    endpoints: () => ({})
})


export default baseApi;