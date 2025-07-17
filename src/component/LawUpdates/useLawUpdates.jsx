/** @jsxRuntime classic */
/** @jsx React.createElement */

import  React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export const useLawUpdates = (jurisdiction = 'federal') => {
  const [state, setState] = useState({
    updates: [],
    loading: true,
    error: null,
    page: 1,
    hasMore: true,
    filters: {
      category: 'all',
      dateRange: 'last30days'
    }
  });

  const fetchUpdates = useCallback(async (page = 1, filters = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await axios.get(`https://api.legislation.gov/${jurisdiction}/updates`, {
        params: {
          page,
          ...filters,
          _cache: Date.now() // Bypass cache
        }
      });

      setState(prev => ({
        ...prev,
        updates: page === 1 ? response.data : [...prev.updates, ...response.data],
        loading: false,
        hasMore: response.data.length >= 10,
        page
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.message || err.message,
        loading: false
      }));
    }
  }, [jurisdiction]);

  const applyFilters = (newFilters) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...newFilters } }));
    fetchUpdates(1, newFilters);
  };

  const loadMore = () => {
    if (!state.loading && state.hasMore) {
      fetchUpdates(state.page + 1, state.filters);
    }
  };

  useEffect(() => {
    const cacheKey = `lawUpdates-${jurisdiction}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      setState(prev => ({ ...prev, updates: JSON.parse(cachedData), loading: false }));
    }
    
    fetchUpdates();
  }, [fetchUpdates, jurisdiction]);

  useEffect(() => {
    if (state.updates.length > 0) {
      sessionStorage.setItem(
        `lawUpdates-${jurisdiction}`,
        JSON.stringify(state.updates)
      );
    }
  }, [state.updates, jurisdiction]);

  return { ...state, fetchUpdates, applyFilters, loadMore };
};