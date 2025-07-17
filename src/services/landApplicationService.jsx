/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// services/landApplicationService.js
import api from './api';

export const submitApplication = async (formData) => {
  try {
    const response = await api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      transformRequest: (data) => {
        // Handle FormData conversion for nested objects
        const formData = new FormData();
        
        // Append all fields to FormData
        Object.keys(data).forEach(key => {
          if (key === 'documents') {
            // Handle multiple files
            data[key].forEach(file => {
              formData.append('documents', file);
            });
          } else if (data[key] instanceof File) {
            formData.append(key, data[key]);
          } else if (typeof data[key] === 'object' && data[key] !== null) {
            // Stringify nested objects
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        });
        
        return formData;
      }
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Application submitted successfully'
    };
  } catch (error) {
    console.error('Application submission error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 
             error.message || 
             'Failed to submit application. Please try again.'
    };
  }
};

export const getApplications = async (params = {}) => {
  try {
    // Convert date objects to strings if present
    const processedParams = { ...params };
    if (params.startDate) {
      processedParams.startDate = params.startDate.toISOString().split('T')[0];
    }
    if (params.endDate) {
      processedParams.endDate = params.endDate.toISOString().split('T')[0];
    }

    const response = await api.get('/applications', { 
      params: processedParams,
      paramsSerializer: {
        indexes: null // Properly serialize arrays in params
      }
    });

    return {
      success: true,
      data: response.data.items || [],
      totalCount: response.data.totalCount || 0,
      pagination: response.data.pagination || {}
    };
  } catch (error) {
    console.error('Fetch applications error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 
             'Failed to fetch applications. Please try again.',
      data: [],
      totalCount: 0
    };
  }
};

export const getApplicationById = async (id) => {
  try {
    const response = await api.get(`/applications/${id}`);
    return {
      success: true,
      data: response.data,
      message: 'Application retrieved successfully'
    };
  } catch (error) {
    console.error('Fetch application error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 
             `Failed to fetch application ${id}. Please try again.`,
      data: null
    };
  }
};

export const updateApplicationStatus = async (id, action, notes = '') => {
  try {
    const response = await api.patch(`/applications/${id}/status`, { 
      action, 
      notes,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      data: response.data,
      message: `Application ${action} successfully`
    };
  } catch (error) {
    console.error('Update status error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 
             `Failed to ${action} application. Please try again.`,
      data: null
    };
  }
};

export const requestAdditionalInfo = async (id, requirements) => {
  try {
    const response = await api.post(`/applications/${id}/request-info`, {
      requirements,
      requestedAt: new Date().toISOString()
    });

    return {
      success: true,
      data: response.data,
      message: 'Information request submitted successfully'
    };
  } catch (error) {
    console.error('Request info error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 
             'Failed to request additional information. Please try again.',
      data: null
    };
  }
};

export const deleteApplication = async (id) => {
  try {
    const response = await api.delete(`/applications/${id}`);
    return {
      success: true,
      data: response.data,
      message: 'Application deleted successfully'
    };
  } catch (error) {
    console.error('Delete application error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 
             'Failed to delete application. Please try again.',
      data: null
    };
  }
};

// Additional utility functions
export const downloadApplicationDocument = async (applicationId, documentId) => {
  try {
    const response = await api.get(
      `/applications/${applicationId}/documents/${documentId}`,
      { responseType: 'blob' }
    );
    
    return {
      success: true,
      data: response.data,
      message: 'Document downloaded successfully'
    };
  } catch (error) {
    console.error('Download document error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 
             'Failed to download document. Please try again.',
      data: null
    };
  }
};

export const getApplicationHistory = async (id) => {
  try {
    const response = await api.get(`/applications/${id}/history`);
    return {
      success: true,
      data: response.data,
      message: 'Application history retrieved successfully'
    };
  } catch (error) {
    console.error('Fetch history error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 
             'Failed to fetch application history. Please try again.',
      data: []
    };
  }
};