/** @jsxRuntime classic */
/** @jsx React.createElement */

// hooks/useLandApplication.js
import React, { useState } from 'react';
import { submitApplication as apiSubmitApplication } from '../services/landApplicationService';

const useLandApplication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submitApplication = async (values) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      const result = await apiSubmitApplication(formData);
      
      if (result.success) {
        setSuccess('Application submitted successfully!');
        return true;
      } else {
        throw new Error(result.message || 'Failed to submit application');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit application');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitApplication,
    loading,
    error,
    success
  };
};

export default useLandApplication;