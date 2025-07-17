// src/api/employeeApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: () => 'employees',
    }),
  }),
});

export const { useGetEmployeesQuery } = employeeApi;