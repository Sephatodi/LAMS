import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const climateApi = createApi({
  reducerPath: 'climateApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/climate' }),
  tagTypes: ['ClimateRisks', 'RelocationPlans', 'ResourceAllocations'],
  endpoints: (builder) => ({
    getClimateRisks: builder.query({
      query: () => 'risks',
      providesTags: ['ClimateRisks']
    }),
    getRelocationPlans: builder.query({
      query: () => 'relocation-plans',
      providesTags: ['RelocationPlans']
    }),
    createRelocationPlan: builder.mutation({
      query: (plan) => ({
        url: 'relocation-plans',
        method: 'POST',
        body: plan
      }),
      invalidatesTags: ['RelocationPlans']
    }),
    getResourceAllocations: builder.query({
      query: () => 'allocations',
      providesTags: ['ResourceAllocations']
    }),
    updateAllocation: builder.mutation({
      query: ({ id, newAllocation }) => ({
        url: `allocations/${id}`,
        method: 'PATCH',
        body: { newAllocation }
      }),
      invalidatesTags: ['ResourceAllocations']
    })
  })
});

export const {
  useGetClimateRisksQuery,
  useGetRelocationPlansQuery,
  useCreateRelocationPlanMutation,
  useGetResourceAllocationsQuery,
  useUpdateAllocationMutation
} = climateApi;