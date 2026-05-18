import baseApi from "../../api/api";
import { AnalyticsQueryParams, AnalyticsResponse } from "./dashboard.type";

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
        })
    }),
});

export const {
    useGetAnalyticsQuery,
} = dashboardApi;