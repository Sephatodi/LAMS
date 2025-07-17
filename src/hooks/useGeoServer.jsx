/** @jsxRuntime classic */
/** @jsx React.createElement */


import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { GEOSERVER_CONFIG, WFS_ENDPOINTS } from '../config/geoserver.config';
import { useAuth } from './useAuth';

export const useGeoServer = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWFSAuthHeaders = useCallback(() => {
    return {
      Authorization: `Basic ${btoa(`${GEOSERVER_CONFIG.AUTH.USERNAME}:${GEOSERVER_CONFIG.AUTH.PASSWORD}`)}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const fetchWFSData = useCallback(async (url) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(url, {
        headers: fetchWFSAuthHeaders(),
        timeout: 10000
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWFSAuthHeaders]);

  const fetchParcels = useCallback(async (bbox = null) => {
    const url = WFS_ENDPOINTS.getParcels(bbox);
    return await fetchWFSData(url);
  }, [fetchWFSData]);

  const fetchTribalBoundaries = useCallback(async () => {
    const url = WFS_ENDPOINTS.getTribalBoundaries();
    return await fetchWFSData(url);
  }, [fetchWFSData]);

  const spatialQuery = useCallback(async (geometry, layer) => {
    const url = WFS_ENDPOINTS.spatialQuery(geometry, layer);
    return await fetchWFSData(url);
  }, [fetchWFSData]);

  return {
    loading,
    error,
    fetchParcels,
    fetchTribalBoundaries,
    spatialQuery,
    config: GEOSERVER_CONFIG
  };
};

export default useGeoServer;