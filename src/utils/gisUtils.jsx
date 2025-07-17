/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// src/utils/gisUtils.js
export async function fetchBotswanaLandParcels() {
  try {
    const response = await fetch('YOUR_API_ENDPOINT');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching land parcels:', error);
    return [];
  }
}