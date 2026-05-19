import baseApi from "../../api/api";
import { GetAllMenuResponse, AddMenuBody, AddMenuResponse, UpdateMenuBody, UpdateMenuResponse, DeleteMenuResponse, GetAllSectionResponse, AddSectionBody, AddSectionResponse } from "./menu.type";

const menuApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // menu*********************************************************
        getAllMenu: builder.query<GetAllMenuResponse, void>({
            query: () => {
                return {
                    url: "/menu",
                    method: "GET",
                };
            },
            providesTags: ["menu"],
        }),
        addMenu: builder.mutation<AddMenuResponse, AddMenuBody>({
            query: (data) => {
                return {
                    url: "/menu",
                    method: "POST",
                    body: data,
                };
            },
            invalidatesTags: ["menu"],
        }),
        deleteMenu: builder.mutation<DeleteMenuResponse, number>({
            query: (menuId) => {
                return {
                    url: `/menu/${menuId}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["menu"],
        }),
        updateMenu: builder.mutation<UpdateMenuResponse, { menuId: number; data: UpdateMenuBody }>({
            query: ({ menuId, data }) => {
                return {
                    url: `/menu/${menuId}`,
                    method: "PATCH",
                    body: data,
                };
            },
            invalidatesTags: ["menu"],
        }),

        // section**************************************************
        addSection: builder.mutation<AddSectionResponse, AddSectionBody>({
            query: (data) => {
                return {
                    url: "/section",
                    method: "POST",
                    body: data,
                };
            },
            invalidatesTags: ["section"],
        }),
        deleteSection: builder.mutation({
            query: (sectionId) => {
                return {
                    url: `/section/${sectionId}`,
                    method: "DELETE"
                };
            },
            invalidatesTags: ["section"],
        }),
        getAllSectionByMenuId: builder.query<GetAllSectionResponse, number>({
            query: (menuId) => {
                return {
                    url: `/section?menuId=${menuId}`,
                    method: "GET",
                };
            },
            providesTags: ["section", "menu"],
        }),
        getAllSectionDetailsByMenuId: builder.query({
            query: (sectionId) => {
                return {
                    url: `/section/${sectionId}`,
                    method: "GET",
                };
            },
            providesTags: ["section"],
        }),
        updateSection: builder.mutation({
            query: ({ data, sectionId }) => {
                return {
                    url: `/section/${sectionId}`,
                    method: "PATCH",
                    body: data,
                };
            },
            invalidatesTags: ["section"],
        }),
    }),
});

export const {
    useGetAllMenuQuery,
    useAddMenuMutation,
    useDeleteMenuMutation,
    useUpdateMenuMutation,
    useAddSectionMutation,
    useDeleteSectionMutation,
    useGetAllSectionByMenuIdQuery,
    useGetAllSectionDetailsByMenuIdQuery,
    useUpdateSectionMutation,
} = menuApi;