import axios from 'axios';
import { tribalBoundaries } from '../data/tribalBoundaries'; // Botswana tribal boundaries GeoJSON

// Configure API base URL using Vite's import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1/land';

// Botswana-specific configuration
const BOTSWANA_CONFIG = {
  DEFAULT_CRS: 'EPSG:3857', // Web Mercator
  AREA_UNIT: 'hectares', // Common land measurement unit in Botswana
  LAND_USE_TYPES: [
    'residential',
    'commercial',
    'agricultural',
    'industrial',
    'conservation',
    'community',
    'government'
  ],
  TRIBAL_LANDS: tribalBoundaries.features.map(f => f.properties.name)
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const landService = {
  // Basic CRUD operations
  async getLandParcels() {
    try {
      const response = await apiClient.get('/');
      return this._formatParcelData(response.data);
    } catch (error) {
      throw this._handleError(error, 'Failed to fetch land parcels');
    }
  },

  async getLandParcelById(id) {
    try {
      const response = await apiClient.get(`/${id}`);
      return this._formatParcelData([response.data])[0];
    } catch (error) {
      throw this._handleError(error, 'Failed to fetch land parcel');
    }
  },

  async createLandParcel(parcelData) {
    try {
      this._validateParcelData(parcelData);
      const response = await apiClient.post('/', parcelData);
      return this._formatParcelData([response.data])[0];
    } catch (error) {
      throw this._handleError(error, 'Failed to create land parcel');
    }
  },

  async updateLandParcel(id, parcelData) {
    try {
      this._validateParcelData(parcelData);
      const response = await apiClient.put(`/${id}`, parcelData);
      return this._formatParcelData([response.data])[0];
    } catch (error) {
      throw this._handleError(error, 'Failed to update land parcel');
    }
  },

  // Specialized queries
  async getLandInRadius(lat, lng, distance) {
    try {
      const response = await apiClient.get(`/radius/${lat}/${lng}/${distance}`);
      return this._formatParcelData(response.data);
    } catch (error) {
      throw this._handleError(error, 'Failed to fetch land in radius');
    }
  },

  async getLandStats() {
    try {
      const response = await apiClient.get('/stats');
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Failed to fetch land statistics');
    }
  },

  async searchLandParcels(query, filters = {}) {
    try {
      const response = await apiClient.post('/search', {
        query,
        filters: this._normalizeFilters(filters)
      });
      return this._formatParcelData(response.data);
    } catch (error) {
      throw this._handleError(error, 'Land search failed');
    }
  },

  async getParcelsByTribalLand(tribalLand) {
    try {
      if (!BOTSWANA_CONFIG.TRIBAL_LANDS.includes(tribalLand)) {
        throw new Error(`Invalid tribal land: ${tribalLand}`);
      }
      const response = await apiClient.get(`?tribalLand=${tribalLand}`);
      return this._formatParcelData(response.data);
    } catch (error) {
      throw this._handleError(error, 'Failed to fetch parcels by tribal land');
    }
  },

  // Botswana-specific methods
  async allocateParcel(parcelId, allocationData) {
    try {
      if (!allocationData.applicantName || !allocationData.applicantId) {
        throw new Error('Applicant name and ID are required for allocation');
      }
      const response = await apiClient.post(
        `/${parcelId}/allocate`,
        allocationData
      );
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Failed to allocate parcel');
    }
  },

  // Helper methods
  _formatParcelData(parcels) {
    return parcels.map(parcel => ({
      ...parcel,
      areaInHectares: parcel.area ? parcel.area / 10000 : 0,
      statusColor: this._getStatusColor(parcel.status),
      tribalLand: parcel.tribalLand || 'Not specified'
    }));
  },

  _getStatusColor(status) {
    const statusColors = {
      allocated: '#d32f2f',
      available: '#388e3c',
      reserved: '#ff9800',
      disputed: '#f44336',
      government: '#1976d2',
      default: '#9e9e9e'
    };
    return statusColors[status] || statusColors.default;
  },

  _validateParcelData(parcelData) {
    if (!parcelData.coordinates || !Array.isArray(parcelData.coordinates)) {
      throw new Error('Valid coordinates are required');
    }
    if (parcelData.tribalLand && !BOTSWANA_CONFIG.TRIBAL_LANDS.includes(parcelData.tribalLand)) {
      throw new Error(`Invalid tribal land: ${parcelData.tribalLand}`);
    }
    if (parcelData.landUse && !BOTSWANA_CONFIG.LAND_USE_TYPES.includes(parcelData.landUse)) {
      throw new Error(`Invalid land use type: ${parcelData.landUse}`);
    }
  },

  _normalizeFilters(filters) {
    return {
      ...filters,
      areaRange: filters.areaRange?.map(val => val * 10000) || [0, 100000000]
    };
  },

  _handleError(error, defaultMessage) {
    if (error.response) {
      const errorMessage = error.response.data?.message || defaultMessage;
      const errorDetails = error.response.data?.details;
      const err = new Error(errorMessage);
      err.details = errorDetails;
      err.status = error.response.status;
      throw err;
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error(error.message || defaultMessage);
    }
  }
};

// Tribal land service remains unchanged
export const tribalLandService = {
  async getAllTribalLands() {
    try {
      return tribalBoundaries.features.map(feature => ({
        id: feature.properties.id,
        name: feature.properties.name,
        chief: feature.properties.chief,
        landBoard: feature.properties.landBoard,
        area: feature.properties.area,
        geometry: feature.geometry
      }));
    } catch (error) {
      throw new Error('Failed to load tribal land data');
    }
  },
  
  async getTribalLandByName(name) {
    const tribalLands = await this.getAllTribalLands();
    return tribalLands.find(land => land.name === name);
  }
};

export default landService;