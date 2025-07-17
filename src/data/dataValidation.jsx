/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// dataValidation.js
export function validateInputData(geoData) {
    if (!geoData || typeof geoData !== 'object') {
      return false;
    }
  
    // Check for required properties
    const requiredProps = ['type', 'features', 'crs', 'district'];
    if (!requiredProps.every(prop => prop in geoData)) {
      return false;
    }
  
    // Validate coordinate reference system
    if (!geoData.crs || !geoData.crs.properties || !geoData.crs.properties.name) {
      return false;
    }
  
    // Validate features array
    if (!Array.isArray(geoData.features) || geoData.features.length === 0) {
      return false;
    }
  
    // Validate individual features
    return geoData.features.every(feature => {
      return feature.type === 'Feature' &&
             feature.properties &&
             feature.geometry &&
             feature.geometry.coordinates;
    });
  }