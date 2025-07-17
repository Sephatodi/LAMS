/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// spatialIndex.js
export class SpatialIndex {
    constructor(features) {
      this.index = new Map();
      this.buildIndex(features);
    }
  
    buildIndex(features) {
      features.forEach(feature => {
        const key = this.getGridKey(feature.geometry.coordinates[0][0]);
        if (!this.index.has(key)) {
          this.index.set(key, []);
        }
        this.index.get(key).push(feature);
      });
    }
  
    getGridKey(coordinate, gridSize = 0.01) {
      const lat = Math.floor(coordinate[1] / gridSize) * gridSize;
      const lng = Math.floor(coordinate[0] / gridSize) * gridSize;
      return `${lat},${lng}`;
    }
  
    query(bbox) {
      const minKey = this.getGridKey([bbox[0], bbox[1]]);
      const maxKey = this.getGridKey([bbox[2], bbox[3]]);
      
      const results = [];
      for (const [key, features] of this.index) {
        if (this.isKeyInRange(key, minKey, maxKey)) {
          results.push(...features);
        }
      }
      return results;
    }
  
    isKeyInRange(key, minKey, maxKey) {
      // Implementation for range checking
    }
  }