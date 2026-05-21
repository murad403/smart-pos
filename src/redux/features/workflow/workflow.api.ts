import baseApi from "../../api/api";


const workflowApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTables: builder.query({
            query: () => {
                return {
                    url: "/table",
                    method: "GET",
                };
            },
        }),
    }),
});

export const {

} = workflowApi;