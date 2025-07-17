/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// src/utils/validationSchemas.js
import * as Yup from 'yup';

// Common regex patterns
const phoneRegExp = /^\+?[0-9]{7,15}$/;
const nationalIdRegExp = /^[0-9]{9}$/;
const emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const plotNumberRegExp = /^[A-Z0-9/-]+$/;

// File validation helpers
const validateFileSize = (file, maxSizeMB) => 
  file && file.size <= maxSizeMB * 1024 * 1024;

const validateFileType = (file, allowedTypes) => 
  file && allowedTypes.includes(file.type);

// Supported document types
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];

// Water schema validator (example schema)
const waterSchema = {
  validate: (data) => {
    const errors = [];
    let valid = true;
    const normalized = { ...data };

    // Basic validation example
    if (!data.source || data.source.trim() === '') {
      errors.push('Water source is required');
      valid = false;
    }

    if (data.volume && isNaN(Number(data.volume))) {
      errors.push('Volume must be a number');
      valid = false;
      normalized.volume = parseFloat(data.volume) || 0;
    }

    return { valid, errors, normalized };
  }
};

// Land application schema
const landApplicationSchema = Yup.object().shape({
  // Personal Information
  fullName: Yup.string()
    .required('Full name is required')
    .min(3, 'Must be at least 3 characters')
    .max(100, 'Must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Only alphabetic characters allowed'),
  
  nationalId: Yup.string()
    .required('National ID is required')
    .matches(nationalIdRegExp, 'Must be exactly 9 digits'),
  
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), 'Must be at least 18 years old'),
  
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female'], 'Invalid gender selection'),
  
  citizenship: Yup.string()
    .required('Citizenship status is required')
    .oneOf(['citizen', 'non-citizen'], 'Invalid citizenship status'),
  
  maritalStatus: Yup.string()
    .required('Marital status is required')
    .oneOf(['single', 'married', 'divorced', 'widowed', 'separated'], 'Invalid marital status'),
  
  spouseName: Yup.string()
    .when('maritalStatus', {
      is: 'married',
      then: Yup.string()
        .required('Spouse name is required for married applicants')
        .min(3, 'Must be at least 3 characters')
        .max(100, 'Must be less than 100 characters')
    }),
  
  email: Yup.string()
    .required('Email is required')
    .matches(emailRegExp, 'Invalid email address'),
  
  phone: Yup.string()
    .required('Phone number is required')
    .matches(phoneRegExp, 'Invalid phone number format'),
  
  postalAddress: Yup.string()
    .required('Postal address is required')
    .min(10, 'Must be at least 10 characters'),
  
  // Land Details
  plotLocation: Yup.string()
    .required('Plot location is required')
    .min(5, 'Must be at least 5 characters'),
  
  currentUse: Yup.string()
    .required('Current land use is required'),
  
  landSize: Yup.number()
    .required('Land size is required')
    .min(0.1, 'Minimum 0.1 hectares')
    .max(100, 'Maximum 100 hectares')
    .typeError('Must be a valid number'),
  
  landUnit: Yup.string()
    .required('Land unit is required')
    .oneOf(['hectares', 'acres', 'square-meters'], 'Invalid unit'),
  
  proposedUse: Yup.string()
    .required('Proposed use is required')
    .oneOf(['residential', 'commercial', 'agricultural', 'industrial', 'other'], 'Invalid use type'),
  
  otherUse: Yup.string()
    .when('proposedUse', {
      is: 'other',
      then: Yup.string()
        .required('Please specify the proposed use')
        .min(3, 'Must be at least 3 characters')
    }),
  
  debushed: Yup.boolean(),
  
  // Supporting Documents
  idCopy: Yup.mixed()
    .required('ID copy is required')
    .test('fileSize', 'File too large (max 5MB)', value => validateFileSize(value, 5))
    .test('fileType', 'Unsupported file type', value => validateFileType(value, ALLOWED_DOC_TYPES)),
  
  proofOfResidence: Yup.mixed()
    .required('Proof of residence is required')
    .test('fileSize', 'File too large (max 5MB)', value => validateFileSize(value, 5))
    .test('fileType', 'Unsupported file type', value => validateFileType(value, ALLOWED_DOC_TYPES)),
  
  sitePlan: Yup.mixed()
    .required('Site plan is required')
    .test('fileSize', 'File too large (max 10MB)', value => validateFileSize(value, 10))
    .test('fileType', 'Unsupported file type', value => validateFileType(value, [
      ...ALLOWED_DOC_TYPES,
      'image/svg+xml',
      'application/vnd.dwg'
    ])),
  
  otherDocuments: Yup.mixed()
    .test('fileSize', 'File too large (max 5MB)', value => 
      !value || validateFileSize(value, 5))
    .test('fileType', 'Unsupported file type', value => 
      !value || validateFileType(value, ALLOWED_DOC_TYPES)),
  
  // Declaration
  declarationAccepted: Yup.boolean()
    .oneOf([true], 'You must accept the declaration')
});

// Export all schemas
export const schemaValidator = {
  waterSchema,
  landApplicationSchema,
  
  // Helper function to validate any schema
  validate: (schema, data) => {
    try {
      if (schema.validate) {
        // For custom schema validators
        return schema.validate(data);
      }
      
      // For Yup schemas
      return schema.validateSync(data, { abortEarly: false });
    } catch (error) {
      if (error.inner) {
        // Yup validation errors
        const errors = error.inner.reduce((acc, curr) => {
          acc[curr.path] = curr.message;
          return acc;
        }, {});
        return { valid: false, errors };
      }
      return { valid: false, errors: { general: error.message } };
    }
  },
  
  // Helper to get initial values for a schema
  getInitialValues: (schema) => {
    if (schema.cast) {
      // Yup schema
      return schema.cast({});
    }
    return {};
  }
};
// Add this at the bottom of the file (before the last export)
// At the end of validationSchema.js
// At the end of your validationSchema.js:
export default landApplicationSchema; // Default export
export { Yup }; // Named exports

