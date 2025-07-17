/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import axios from 'axios';
import * as geotiff from 'geotiff';

class TerrainModeling {
  constructor () {
    this.apiUrl = process.env.REACT_APP_TERRAIN_API_URL || 'https://api.gis.gov.bw/v1/terrain';
    this.demCache = new Map();
  }

  async getElevationData(bbox, resolution = 30) {
    const cacheKey = `${bbox.join('_')}_${resolution}`;
    if (this.demCache.has(cacheKey)) {
      return this.demCache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${this.apiUrl}/elevation`, {
        params: {
          bbox: bbox.join(','),
          resolution
        },
        responseType: 'arraybuffer'
      });

      const arrayBuffer = response.data;
      const tiff = await geotiff.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      const [dem] = await image.readRasters();

      const result = {
        data: dem,
        width: image.getWidth(),
        height: image.getHeight(),
        bbox,
        resolution,
        noDataValue: image.getGDALNoData()
      };

      this.demCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to fetch elevation data:', error);
      throw error;
    }
  }

  async calculateSlope(bbox, resolution = 30) {
    try {
      const response = await axios.get(`${this.apiUrl}/slope`, {
        params: {
          bbox: bbox.join(','),
          resolution,
          output_format: 'geotiff'
        },
        responseType: 'arraybuffer'
      });

      const arrayBuffer = response.data;
      const tiff = await geotiff.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      return await image.readRasters();
    } catch (error) {
      console.error('Failed to calculate slope:', error);
      throw error;
    }
  }

  async calculateAspect(bbox, resolution = 30) {
    try {
      const response = await axios.get(`${this.apiUrl}/aspect`, {
        params: {
          bbox: bbox.join(','),
          resolution,
          output_format: 'geotiff'
        },
        responseType: 'arraybuffer'
      });

      const arrayBuffer = response.data;
      const tiff = await geotiff.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      return await image.readRasters();
    } catch (error) {
      console.error('Failed to calculate aspect:', error);
      throw error;
    }
  }

  async generateContours(bbox, interval = 10) {
    try {
      const response = await axios.get(`${this.apiUrl}/contours`, {
        params: {
          bbox: bbox.join(','),
          interval
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate contours:', error);
      throw error;
    }
  }

  async calculateViewshed(bbox, viewpoint, resolution = 30) {
    try {
      const response = await axios.post(`${this.apiUrl}/viewshed`, {
        bbox,
        viewpoint,
        resolution
      });
      return response.data;
    } catch (error) {
      console.error('Failed to calculate viewshed:', error);
      throw error;
    }
  }

  async calculateWaterFlow(bbox, resolution = 30) {
    try {
      const response = await axios.get(`${this.apiUrl}/waterflow`, {
        params: {
          bbox: bbox.join(','),
          resolution
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to calculate water flow:', error);
      throw error;
    }
  }

  async calculateFloodRisk(bbox, rainfallScenario = '10yr') {
    try {
      const response = await axios.post(`${this.apiUrl}/floodrisk`, {
        bbox,
        rainfall_scenario: rainfallScenario
      });
      return response.data;
    } catch (error) {
      console.error('Failed to calculate flood risk:', error);
      throw error;
    }
  }
}

export default TerrainModeling();