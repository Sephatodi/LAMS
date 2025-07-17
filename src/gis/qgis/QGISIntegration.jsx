/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import axios from 'axios';
import L from 'leaflet';
import 'leaflet.wms';

class QGISIntegration {
  constructor() {
    this.qgisServerUrl = process.env.REACT_APP_QGIS_SERVER_URL || 'https://qgis-server.gov.bw/qgisserver';
    this.wmsLayers = {
      parcels: 'land_parcels',
      administrative: 'administrative_boundaries',
      zoning: 'land_zoning',
      infrastructure: 'public_infrastructure'
    };
    this.cache = {};
  }

  async getCapabilities() {
    try {
      const response = await axios.get(`${this.qgisServerUrl}?SERVICE=WMS&REQUEST=GetCapabilities`);
      return response.data;
    } catch (error) {
      console.error('Failed to get QGIS Server capabilities:', error);
      throw error;
    }
  }

  getWMSLayer(layerName, options = {}) {
    if (!this.wmsLayers[layerName]) {
      throw new Error(`Layer ${layerName} not configured`);
    }

    return L.tileLayer.wms(this.qgisServerUrl, {
      layers: this.wmsLayers[layerName],
      format: 'image/png',
      transparent: true,
      version: '1.3.0',
      crs: L.CRS.EPSG4326,
      attribution: 'Botswana Government © 2023',
      ...options
    });
  }

  async queryFeatureInfo(layerName, latlng, params = {}) {
    const layer = this.wmsLayers[layerName];
    if (!layer) {
      throw new Error(`Layer ${layerName} not configured`);
    }

    const { lat, lng } = latlng;
    const url = `${this.qgisServerUrl}?` + new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.3.0',
      REQUEST: 'GetFeatureInfo',
      LAYERS: layer,
      QUERY_LAYERS: layer,
      INFO_FORMAT: 'application/json',
      CRS: 'EPSG:4326',
      I: 50,
      J: 50,
      WIDTH: 101,
      HEIGHT: 101,
      X: 50,
      Y: 50,
      BBOX: `${lng-0.001},${lat-0.001},${lng+0.001},${lat+0.001}`,
      ...params
    });

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to query feature info:', error);
      throw error;
    }
  }

  async applyStyle(layerName, styleName) {
    const cacheKey = `${layerName}_${styleName}`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const response = await axios.get(`/gis/qgis/styles/${styleName}.qml`);
      const style = response.data;
      
      // In a real implementation, we would send this to QGIS Server
      // This is a simplified version for React
      this.cache[cacheKey] = {
        ...this.wmsLayers[layerName],
        styles: style
      };
      
      return this.cache[cacheKey];
    } catch (error) {
      console.error('Failed to apply style:', error);
      throw error;
    }
  }

  async getPrintMap(layers, bbox, size = 'A4', format = 'pdf') {
    const layerList = Array.isArray(layers) ? layers.join(',') : layers;
    
    try {
      const response = await axios.get(`${this.qgisServerUrl}?`, {
        params: {
          SERVICE: 'WMS',
          VERSION: '1.3.0',
          REQUEST: 'GetPrint',
          FORMAT: `application/${format}`,
          LAYERS: layerList,
          CRS: 'EPSG:4326',
          BBOX: bbox.join(','),
          WIDTH: size === 'A4' ? 800 : 1200,
          HEIGHT: size === 'A4' ? 600 : 900,
          TEMPLATE: 'botswana_standard',
          DPI: 300
        },
        responseType: 'blob'
      });
      
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('Failed to generate print map:', error);
      throw error;
    }
  }
}

export default QGISIntegration();