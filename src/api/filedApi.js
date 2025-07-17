import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const fieldApi = createApi({
  reducerPath: 'fieldApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/field' }),
  tagTypes: ['FieldData'],
  endpoints: (builder) => ({
    getFieldData: builder.query({
      query: () => 'data',
      providesTags: ['FieldData']
    }),
    syncFieldData: builder.mutation({
      query: (unsyncedItems) => ({
        url: 'sync',
        method: 'POST',
        body: unsyncedItems
      }),
      invalidatesTags: ['FieldData']
    })
  })
});

export const { useGetFieldDataQuery, useSyncFieldDataMutation } = fieldApi;