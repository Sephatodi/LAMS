/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import turf from '@turf/turf';
import axios from 'axios';

class SpatialAnalysis {
  constructor() {
    this.apiUrl = process.env.REACT_APP_SPATIAL_API_URL || 'https://api.gis.gov.bw/v1/analysis';
  }

  async bufferAnalysis(geometry, distance, unit = 'kilometers') {
    try {
      // For complex analysis, use backend service
      if (geometry.type === 'FeatureCollection' || distance > 100) {
        const response = await axios.post(`${this.apiUrl}/buffer`, {
          geometry,
          distance,
          unit
        });
        return response.data;
      }

      // Simple buffers can be done client-side with Turf.js
      const buffered = turf.buffer(geometry, distance, { units: unit });
      return {
        type: 'FeatureCollection',
        features: [buffered]
      };
    } catch (error) {
      console.error('Failed to perform buffer analysis:', error);
      throw error;
    }
  }

  async proximityAnalysis(features, target, radius) {
    try {
      const response = await axios.post(`${this.apiUrl}/proximity`, {
        features,
        target,
        radius
      });
      return response.data;
    } catch (error) {
      console.error('Failed to perform proximity analysis:', error);
      throw error;
    }
  }

  async overlayAnalysis(layer1, layer2, operation = 'intersection') {
    try {
      const validOperations = ['intersection', 'union', 'difference'];
      if (!validOperations.includes(operation)) {
        throw new Error(`Invalid operation. Must be one of: ${validOperations.join(', ')}`);
      }

      const response = await axios.post(`${this.apiUrl}/overlay`, {
        layer1,
        layer2,
        operation
      });
      return response.data;
    } catch (error) {
      console.error('Failed to perform overlay analysis:', error);
      throw error;
    }
  }

  async suitabilityAnalysis(criteriaLayers, weights) {
    try {
      if (criteriaLayers.length !== weights.length) {
        throw new Error('Criteria layers and weights must have the same length');
      }

      const response = await axios.post(`${this.apiUrl}/suitability`, {
        criteria_layers: criteriaLayers,
        weights
      });
      return response.data;
    } catch (error) {
      console.error('Failed to perform suitability analysis:', error);
      throw error;
    }
  }

  async calculateArea(geometry, unit = 'squareKilometers') {
    try {
      // Use Turf.js for client-side calculations
      return turf.area(geometry) / (unit === 'squareKilometers' ? 1000000 : 1);
    } catch (error) {
      console.error('Failed to calculate area:', error);
      throw error;
    }
  }

  async calculateCentroid(geometry) {
    try {
      return turf.centroid(geometry);
    } catch (error) {
      console.error('Failed to calculate centroid:', error);
      throw error;
    }
  }

  async generateVoronoi(points, bbox) {
    try {
      const response = await axios.post(`${this.apiUrl}/voronoi`, {
        points,
        bbox
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate Voronoi diagram:', error);
      throw error;
    }
  }
}

export default new SpatialAnalysis();