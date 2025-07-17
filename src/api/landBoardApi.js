// /src/api/landBoardApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const landBoardApi = createApi({
  reducerPath: 'landBoardApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/land-board' }),
  tagTypes: ['Employees', 'Tasks', 'Deadlines', 'Cases'],
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: () => 'employees',
      providesTags: ['Employees']
    }),
    getTasks: builder.query({
      query: () => 'tasks',
      providesTags: ['Tasks']
    }),
    getDeadlines: builder.query({
      query: () => 'deadlines',
      providesTags: ['Deadlines']
    }),
    getPendingCases: builder.query({
      query: () => 'cases/pending',
      providesTags: ['Cases']
    }),
    uploadDocument: builder.mutation({
      query: (file) => ({
        url: 'documents',
        method: 'POST',
        body: file
      }),
      invalidatesTags: ['Cases']
    }),
    assignCase: builder.mutation({
      query: ({ caseId, employeeId }) => ({
        url: `cases/${caseId}/assign`,
        method: 'PATCH',
        body: { employeeId }
      }),
      invalidatesTags: ['Cases', 'Employees']
    })
  })
});

export const { 
  useGetEmployeesQuery,
  useGetTasksQuery,
  useGetDeadlinesQuery,
  useGetPendingCasesQuery,
  useUploadDocumentMutation,
  useAssignCaseMutation
} = landBoardApi;