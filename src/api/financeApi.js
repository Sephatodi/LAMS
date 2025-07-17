import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const financeApi = createApi({
  reducerPath: 'financeApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/finance' }),
  tagTypes: ['Leases', 'Payments', 'Debts', 'Subsidies', 'Revenue', 'Costs'],
  endpoints: (builder) => ({
    getLeases: builder.query({
      query: () => 'leases',
      providesTags: ['Leases']
    }),
    generateInvoices: builder.mutation({
      query: ({ leaseIds, invoiceDate }) => ({
        url: 'invoices',
        method: 'POST',
        body: { leaseIds, invoiceDate }
      }),
      invalidatesTags: ['Leases', 'Payments']
    }),
    getPayments: builder.query({
      query: () => 'payments',
      providesTags: ['Payments']
    }),
    getDebts: builder.query({
      query: () => 'debts',
      providesTags: ['Debts']
    }),
    sendReminder: builder.mutation({
      query: ({ debtId, message }) => ({
        url: `debts/${debtId}/remind`,
        method: 'POST',
        body: { message }
      }),
      invalidatesTags: ['Debts']
    }),
    getRevenueForecast: builder.query({
      query: (timeframe = '12') => `revenue/forecast?months=${timeframe}`,
      providesTags: ['Revenue']
    }),
    getCostAnalysis: builder.query({
      query: () => 'costs',
      providesTags: ['Costs']
    }),
    getSubsidies: builder.query({
      query: () => 'subsidies',
      providesTags: ['Subsidies']
    }),
    addSubsidy: builder.mutation({
      query: (subsidy) => ({
        url: 'subsidies',
        method: 'POST',
        body: subsidy
      }),
      invalidatesTags: ['Subsidies']
    })
  })
});

export const {
  useGetLeasesQuery,
  useGenerateInvoicesMutation,
  useGetPaymentsQuery,
  useGetDebtsQuery,
  useSendReminderMutation,
  useGetRevenueForecastQuery,
  useGetCostAnalysisQuery,
  useGetSubsidiesQuery,
  useAddSubsidyMutation
} = financeApi;