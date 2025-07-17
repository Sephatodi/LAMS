import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const dataApi = createApi({
  reducerPath: 'dataApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/data' }),
  tagTypes: ['Datasets'],
  endpoints: (builder) => ({
    getDataLake: builder.query({
      query: () => 'datasets',
      providesTags: ['Datasets']
    })
  })
});

export const { useGetDataLakeQuery } = dataApi;