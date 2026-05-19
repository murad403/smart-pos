import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// base query-----------------------------------------------------------------------------------------------
const baseQuery = fetchBaseQuery({
     baseUrl: process.env.NEXT_PUBLIC_BASE_URL
})


const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: baseQuery,
    tagTypes: ["menu", "section"],
    endpoints: () => ({})
})


export default baseApi;