/** @jsxRuntime classic */
/** @jsx React.createElement */

/* eslint-disable no-undef */
// src/hooks/useLayerManager.js
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Advanced layer management hook with performance optimization
 * @returns {Object} Layer management methods
 */
export const useLayerManager = () => {
  const map = useMap();
  const layersRef = useRef(new Map());

  useEffect(() => {
    return () => {
      // Cleanup all layers on unmount
      layersRef.current.forEach((layer, id) => {
        layer.remove();
        layersRef.current.delete(id);
      });
    };
  }, []);

  const addLayer = (id, layer) => {
    if (layersRef.current.has(id)) {
      updateLayer(id, layer);
    } else {
      layer.addTo(map);
      layersRef.current.set(id, layer);
    }
  };

  const removeLayer = (id) => {
    if (layersRef.current.has(id)) {
      layersRef.current.get(id).remove();
      layersRef.current.delete(id);
    }
  };

  const updateLayerStyle = (id, styleFn) => {
    const layer = layersRef.current.get(id);
    if (layer) {
      layer.setStyle(styleFn);
      layer.redraw();
    }
  };

  return {
    addLayer,
    removeLayer,
    updateLayerStyle,
    getLayer: (id) => layersRef.current.get(id)
  };
};

export default useLayerManager;