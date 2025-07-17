import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const policyApi = createApi({
  reducerPath: 'policyApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/policies' }),
  tagTypes: ['Policies', 'Versions', 'RegulatoryChanges', 'ComplianceTasks', 'ImpactAssessments'],
  endpoints: (builder) => ({
    getPolicies: builder.query({
      query: () => '',
      providesTags: ['Policies']
    }),
    parsePolicy: builder.mutation({
      query: ({ policyText, effectiveDate }) => ({
        url: 'parse',
        method: 'POST',
        body: { policyText, effectiveDate }
      }),
      invalidatesTags: ['Policies']
    }),
    getPolicyVersions: builder.query({
      query: (policyId) => `${policyId}/versions`,
      providesTags: ['Versions']
    }),
    checkCompliance: builder.mutation({
      query: (decision) => ({
        url: 'compliance',
        method: 'POST',
        body: decision
      })
    }),
    getRegulatoryChanges: builder.query({
      query: () => 'regulatory-changes',
      providesTags: ['RegulatoryChanges']
    }),
    subscribeToChanges: builder.mutation({
      query: (changeId) => ({
        url: `regulatory-changes/${changeId}/subscribe`,
        method: 'POST'
      }),
      invalidatesTags: ['RegulatoryChanges']
    }),
    getImpactAssessment: builder.query({
      query: (regulationId) => `impact-assessments/${regulationId}`,
      providesTags: ['ImpactAssessments']
    }),
    generateComplianceTasks: builder.mutation({
      query: (regulationId) => ({
        url: `compliance-tasks/${regulationId}`,
        method: 'POST'
      }),
      invalidatesTags: ['ComplianceTasks']
    })
  })
});

export const {
  useGetPoliciesQuery,
  useParsePolicyMutation,
  useGetPolicyVersionsQuery,
  useCheckComplianceMutation,
  useGetRegulatoryChangesQuery,
  useSubscribeToChangesMutation,
  useGetImpactAssessmentQuery,
  useGenerateComplianceTasksMutation
} = policyApi;