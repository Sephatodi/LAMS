/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import { z } from 'zod';

export const formSchema = z.object({
  personalInfo: z.object({
    fullName: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string()
      .email('Invalid email address')
  }),
  caseDetails: z.object({
    caseType: z.enum(['civil', 'criminal', 'family'], {
      required_error: 'Please select a case type'
    }),
    description: z.string()
      .min(20, 'Description must be at least 20 characters')
      .max(1000, 'Description cannot exceed 1000 characters')
  }),
  documents: z.array(z.instanceof(File))
    .optional()
    .refine(files => !files || files.every(file => file.size < 5_000_000), {
      message: 'Each file must be less than 5MB'
    })
});

// Export types for easy reference
export const formDefaultValues = {
  personalInfo: {
    fullName: '',
    email: ''
  },
  caseDetails: {
    caseType: undefined,
    description: ''
  },
  documents: []
};