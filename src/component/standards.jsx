/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// standards.js
export const BOTSWANA_STANDARDS = {
    residential: {
      plotSizes: [
        { type: 'standard', width: 30, depth: 40, area: 1200 },
        { type: 'luxury', width: 50, depth: 70, area: 3500 }
      ],
      roadWidth: 12,
      utilityCorridors: {
        water: 3,
        sewage: 3,
        electricity: 2,
        telecom: 1
      },
      minSetback: 5
    },
    commercial: {
      plotSizes: [
        { type: 'small', width: 40, depth: 60, area: 2400 },
        { type: 'medium', width: 60, depth: 80, area: 4800 },
        { type: 'large', width: 100, depth: 100, area: 10000 }
      ],
      roadWidth: 15,
      utilityCorridors: {
        water: 4,
        sewage: 4,
        electricity: 3,
        telecom: 2
      },
      minSetback: 7.5
    },
    // ... other land use types
    default: {
      plotSizes: [
        { type: 'default', width: 50, depth: 50, area: 2500 }
      ],
      roadWidth: 12,
      utilityCorridors: {
        water: 3,
        sewage: 3,
        electricity: 2,
        telecom: 1
      },
      minSetback: 5
    }
  };