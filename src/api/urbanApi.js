import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const urbanApi = createApi({
  reducerPath: 'urbanApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/urban' }),
  tagTypes: ['GrowthModels', 'LandUsePlans'],
  endpoints: (builder) => ({
    getUrbanGrowthModels: builder.query({
      query: () => 'growth-models',
      providesTags: ['GrowthModels']
    }),
    getLandUsePlans: builder.query({
      query: () => 'land-use-plans',
      providesTags: ['LandUsePlans']
    }),
    optimizeLandUse: builder.mutation({
      query: (params) => ({
        url: 'optimize',
        method: 'POST',
        body: params
      }),
      invalidatesTags: ['LandUsePlans']
    })
  })
});

export const {
  useGetUrbanGrowthModelsQuery,
  useGetLandUsePlansQuery,
  useOptimizeLandUseMutation
} = urbanApi;