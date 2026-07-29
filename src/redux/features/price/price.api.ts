import baseApi from "../../api/api";
import {
  GetAllPriceAdjustmentsResponse,
  GetPriceAdjustmentDetailsResponse,
  CreatePriceAdjustmentBody,
  UpdatePriceAdjustmentBody,
  GetAllAdditionalPricingAdjustmentsResponse,
  GetAdditionalPricingAdjustmentDetailsResponse,
  CreateAdditionalPricingAdjustmentBody,
  UpdateAdditionalPricingAdjustmentBody,
} from "./price.type";

const priceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPriceAdjustments: builder.query<
      GetAllPriceAdjustmentsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams: Record<string, string> = {};
        if (params?.page) queryParams.page = String(params.page);
        if (params?.limit) queryParams.limit = String(params.limit);

        return {
          url: `/pricing-adjustments`,
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["price-adjustment"],
    }),
    getPriceAdjustmentDetails: builder.query<GetPriceAdjustmentDetailsResponse, number>({
      query: (id) => {
        return {
          url: `/pricing-adjustments/${id}`,
          method: "GET",
        };
      },
      providesTags: ["price-adjustment"],
    }),
    createPriceAdjustment: builder.mutation<any, CreatePriceAdjustmentBody>({
      query: (data) => {
        return {
          url: `/pricing-adjustments`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["price-adjustment"],
    }),
    updatePriceAdjustment: builder.mutation<any, { id: number; data: UpdatePriceAdjustmentBody }>({
      query: ({ data, id }) => {
        return {
          url: `/pricing-adjustments/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["price-adjustment"],
    }),
    deletePriceAdjustment: builder.mutation<any, { id: number }>({
      query: ({ id }) => {
        return {
          url: `/pricing-adjustments/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["price-adjustment"],
    }),



    // price adjustment preset**************************
    getAllAdditionalPricingAdjustment: builder.query<
      GetAllAdditionalPricingAdjustmentsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams: Record<string, string> = {};
        if (params?.page) queryParams.page = String(params.page);
        if (params?.limit) queryParams.limit = String(params.limit);

        return {
          url: `/additional-pricing-adjustments`,
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["additional-pricing-adjustment"],
    }),
    getAdditionalPricingAdjustmentDetails: builder.query<
      GetAdditionalPricingAdjustmentDetailsResponse,
      number
    >({
      query: (id) => {
        return {
          url: `/additional-pricing-adjustments/${id}`,
          method: "GET",
        };
      },
      providesTags: ["additional-pricing-adjustment"],
    }),
    createAdditionalPricingAdjustment: builder.mutation<
      any,
      CreateAdditionalPricingAdjustmentBody
    >({
      query: (data) => {
        return {
          url: `/additional-pricing-adjustments`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["additional-pricing-adjustment"],
    }),
    updateAdditionalPricingAdjustment: builder.mutation<
      any,
      { id: number; data: UpdateAdditionalPricingAdjustmentBody }
    >({
      query: ({ data, id }) => {
        return {
          url: `/additional-pricing-adjustments/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["additional-pricing-adjustment"],
    }),
    deleteAdditionalPricingAdjustment: builder.mutation<any, { id: number }>({
      query: ({ id }) => {
        return {
          url: `/additional-pricing-adjustments/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["additional-pricing-adjustment"],
    }),
  }),
});

export const {
  useGetAllPriceAdjustmentsQuery,
  useGetPriceAdjustmentDetailsQuery,
  useCreatePriceAdjustmentMutation,
  useUpdatePriceAdjustmentMutation,
  useDeletePriceAdjustmentMutation,
  useGetAllAdditionalPricingAdjustmentQuery,
  useGetAdditionalPricingAdjustmentDetailsQuery,
  useCreateAdditionalPricingAdjustmentMutation,
  useUpdateAdditionalPricingAdjustmentMutation,
  useDeleteAdditionalPricingAdjustmentMutation,
} = priceApi;