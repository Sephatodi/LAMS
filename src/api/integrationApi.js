import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const integrationApi = createApi({
  reducerPath: 'integrationApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/integrations' }),
  tagTypes: ['Connections'],
  endpoints: (builder) => ({
    getApiConnections: builder.query({
      query: () => '',
      providesTags: ['Connections']
    }),
    testApiConnection: builder.mutation({
      query: (connectionId) => ({
        url: `${connectionId}/test`,
        method: 'POST'
      }),
      invalidatesTags: ['Connections']
    })
  })
});

export const { useGetApiConnectionsQuery, useTestApiConnectionMutation } = integrationApi;