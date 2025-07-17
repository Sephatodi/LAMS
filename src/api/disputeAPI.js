/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// src/features/disputes/disputeAPI.js
const API_BASE_URL = '/api/disputes';

export const fetchDisputes = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}?${query}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch disputes:', error);
    throw error;
  }
};

export const resolveDispute = async (id, resolutionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resolutionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to resolve dispute:', error);
    throw error;
  }
};

export const createDispute = async (disputeData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(disputeData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create dispute:', error);
    throw error;
  }
};