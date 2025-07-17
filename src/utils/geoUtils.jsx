/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// geoUtils.js
import * as turf from '@turf/turf';

// Enhanced area calculation with Turf.js
export const calculateArea = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return 0;
  
  try {
    const polygon = turf.polygon([coordinates]);
    return turf.area(polygon) / 10000; // Convert to hectares
  } catch (error) {
    console.error('Error calculating area:', error);
    return 0;
  }
};

// Enhanced centroid calculation
export const findCentroid = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return [0, 0];
  
  try {
    const polygon = turf.polygon([coordinates]);
    const center = turf.centroid(polygon);
    return center.geometry.coordinates;
  } catch (error) {
    console.error('Error finding centroid:', error);
    return [0, 0];
  }
};

// Point-in-polygon with Turf.js
export const isPointInPolygon = (point, polygonCoordinates) => {
  try {
    const pt = turf.point(point);
    const poly = turf.polygon([polygonCoordinates]);
    return turf.booleanPointInPolygon(pt, poly);
  } catch (error) {
    console.error('Error checking point in polygon:', error);
    return false;
  }
};

// Enhanced parcel validation
export const validateParcelData = (data) => {
  const errors = {};
  
  if (!data.parcelNumber || data.parcelNumber.trim() === '') {
    errors.parcelNumber = 'Parcel number is required';
  } else if (!/^[A-Z0-9-]+$/.test(data.parcelNumber)) {
    errors.parcelNumber = 'Invalid parcel number format';
  }
  
  if (!data.size || isNaN(data.size) || data.size <= 0) {
    errors.size = 'Valid size is required';
  }
  
  if (!data.location || !data.location.coordinates || data.location.coordinates.length < 3) {
    errors.location = 'Valid polygon coordinates are required';
  } else {
    const area = calculateArea(data.location.coordinates);
    if (area < 0.01) { // Minimum 0.01 hectares
      errors.location = 'Parcel area is too small';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Enhanced allocation validation
export const validateAllocationForm = (data) => {
  const errors = {};
  
  if (!data.applicantId || data.applicantId.trim() === '') {
    errors.applicantId = 'Applicant ID is required';
  }
  
  if (!data.purpose || data.purpose.trim() === '') {
    errors.purpose = 'Purpose is required';
  } else if (data.purpose.length > 500) {
    errors.purpose = 'Purpose must be less than 500 characters';
  }
  
  if (!data.duration || isNaN(data.duration) || data.duration <= 0 || data.duration > 99) {
    errors.duration = 'Valid duration (1-99 years) is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// New utility: Calculate distance between two points (in meters)
export const calculateDistance = (point1, point2) => {
  try {
    const from = turf.point(point1);
    const to = turf.point(point2);
    return turf.distance(from, to) * 1000; // Convert to meters
  } catch (error) {
    console.error('Error calculating distance:', error);
    return 0;
  }
};

// New utility: Buffer a geometry
export const createBuffer = (coordinates, radius) => {
  try {
    const polygon = turf.polygon([coordinates]);
    const buffered = turf.buffer(polygon, radius / 1000); // Convert to km
    return buffered.geometry.coordinates;
  } catch (error) {
    console.error('Error creating buffer:', error);
    return coordinates;
  }
};