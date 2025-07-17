/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import axios from 'axios';
import * as geotiff from 'geotiff';

class ImageryService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_IMAGERY_API_URL || 'https://api.satellite.gov.bw/v1';
    this.cache = new Map();
  }

  async getRecentImagery(bbox, cloudCover = 10) {
    const params = {
      bbox: bbox.join(','),
      cloud_cover: cloudCover,
      limit: 5,
      sort: 'acquisition_date,desc'
    };

    try {
      const response = await axios.get(`${this.apiUrl}/imagery`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent imagery:', error);
      throw error;
    }
  }

  async getImageryTile(date, bbox, size = 512) {
    const cacheKey = `${date}_${bbox.join('_')}_${size}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${this.apiUrl}/imagery/${date}/tile`, {
        params: {
          bbox: bbox.join(','),
          size: size,
          format: 'geotiff'
        },
        responseType: 'arraybuffer'
      });

      const arrayBuffer = response.data;
      const tiff = await geotiff.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      const rgb = await image.readRGB();

      this.cache.set(cacheKey, rgb);
      return rgb;
    } catch (error) {
      console.error('Failed to fetch imagery tile:', error);
      throw error;
    }
  }

  async getNDVI(date, bbox) {
    try {
      const response = await axios.get(`${this.apiUrl}/imagery/${date}/ndvi`, {
        params: { bbox: bbox.join(',') },
        responseType: 'arraybuffer'
      });

      const arrayBuffer = response.data;
      const tiff = await geotiff.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      return await image.readRasters();
    } catch (error) {
      console.error('Failed to calculate NDVI:', error);
      throw error;
    }
  }

  async getHistoricImagery(bbox, year) {
    try {
      const response = await axios.get(`${this.apiUrl}/historic/${year}`, {
        params: { bbox: bbox.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch historic imagery:', error);
      throw error;
    }
  }
}

export default  ImageryService();