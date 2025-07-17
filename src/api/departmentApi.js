// src/api/departmentApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const departmentApi = createApi({
  reducerPath: 'departmentApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    getDepartmentMetrics: builder.query({
      query: () => 'departments/metrics',
    }),
  }),
});

export const { useGetDepartmentMetricsQuery } = departmentApi;