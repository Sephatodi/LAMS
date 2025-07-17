/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import axios from 'axios';
import ImageryService from './ImageryService';

class ChangeDetection {
  constructor() {
    this.apiUrl = process.env.REACT_APP_CHANGE_API_URL || 'https://api.satellite.gov.bw/v1/change';
  }

  async detectLandUseChange(bbox, startDate, endDate) {
    try {
      const response = await axios.post(`${this.apiUrl}/landuse`, {
        bbox,
        start_date: startDate,
        end_date: endDate,
        method: 'random_forest'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to detect land use change:', error);
      throw error;
    }
  }

  async detectUrbanExpansion(bbox, years = 5) {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - years);
      const pastDateStr = pastDate.toISOString().split('T')[0];

      const currentImg = await ImageryService.getRecentImagery(bbox, 0);
      const pastImg = await ImageryService.getHistoricImagery(bbox, pastDate.getFullYear());

      const response = await axios.post(`${this.apiUrl}/urban`, {
        current_image: currentImg[0].id,
        past_image: pastImg.id,
        bbox
      });

      return {
        ...response.data,
        currentImage: currentImg[0],
        pastImage: pastImg
      };
    } catch (error) {
      console.error('Failed to detect urban expansion:', error);
      throw error;
    }
  }

  async getChangeVectorAnalysis(bbox, timePoints) {
    try {
      const response = await axios.post(`${this.apiUrl}/vector`, {
        bbox,
        time_points: timePoints
      });
      return response.data;
    } catch (error) {
      console.error('Failed to perform change vector analysis:', error);
      throw error;
    }
  }

  async generateChangeReport(parcelId, years = 10) {
    try {
      // First get parcel geometry from QGIS service
      const qgisResponse = await axios.get(
        `${process.env.REACT_APP_QGIS_SERVER_URL}?` + new URLSearchParams({
          SERVICE: 'WFS',
          VERSION: '1.0.0',
          REQUEST: 'GetFeature',
          TYPENAME: 'land_parcels',
          FEATUREID: parcelId,
          OUTPUTFORMAT: 'application/json'
        })
      );

      const parcel = qgisResponse.data.features[0];
      const bbox = this._calculateBoundingBox(parcel.geometry);

      // Get imagery for the time period
      const currentYear = new Date().getFullYear();
      const imageryPromises = [];
      for (let year = currentYear; year >= currentYear - years; year--) {
        imageryPromises.push(
          ImageryService.getHistoricImagery(bbox, year)
            .catch(() => null) // Skip failed years
        );
      }

      const imageryResults = await Promise.all(imageryPromises);
      const validImagery = imageryResults.filter(img => img !== null);

      // Perform change detection
      const changeResults = await this.detectLandUseChange(
        bbox,
        `${currentYear - years}-01-01`,
        `${currentYear}-12-31`
      );

      return {
        parcel,
        imagery: validImagery,
        changeResults
      };
    } catch (error) {
      console.error('Failed to generate change report:', error);
      throw error;
    }
  }

  _calculateBoundingBox(geometry) {
    // Simplified bounding box calculation
    const coords = geometry.coordinates[0];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const [x, y] of coords) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    return [minX, minY, maxX, maxY];
  }
}

export default  ChangeDetection();