/** @jsxRuntime classic */
/** @jsx React.createElement */

import L from 'leaflet';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useLayerManager } from '../hooks/useLayerManager';
import useMQTT from '../hooks/useMQTT';
import { transformWaterData, validateWaterData } from '../utils/dataHandling';
import { analyzeWaterResources as hydraulicAnalysis } from '../utils/waterModeling';
import LayerErrorBoundary from './LayerErrorBoundary';
import WaterResourcePopup from './WaterResourcePopup';

const WaterResourcesLayer = React.memo(({ 
  infrastructureData,
  enableMonitoring = true,
  styleOverrides,
  maxZoom = 18,
  minZoom = 10,
  zIndex = 650
}) => {
  const { client, isConnected, subscribe, unsubscribe, error: mqttError } = useMQTT(
    process.env.REACT_APP_MQTT_URL || 'wss://iot-gw.land.gov.bw/mqtt'
  );
  const { addLayer, removeLayer, updateLayerStyle } = useLayerManager();
  const [layerInstance, setLayerInstance] = useState(null);

  // Memoized data processing pipeline
  const processedData = useMemo(() => {
    try {
      const validated = validateWaterData(infrastructureData);
      return transformWaterData(validated);
    } catch (error) {
      console.error('Data validation failed:', error);
      return null;
    }
  }, [infrastructureData]);

  // Dynamic style calculation with performance optimization
  const pipeStyle = useCallback((feature) => {
    const baseStyle = {
      color: '#0288d1',
      weight: Math.sqrt(feature.properties?.diameter || 25),
      opacity: 0.8,
      ...styleOverrides
    };

    if (feature.properties?.status === 'leaking') {
      return { ...baseStyle, color: '#ff0000', weight: 8 };
    }
    
    return baseStyle;
  }, [styleOverrides]);

  // Real-time sensor data handling
  useEffect(() => {
    if (!enableMonitoring || !isConnected) return;

    const messageHandler = (topic, payload) => {
      try {
        const update = JSON.parse(payload.toString());
        updateLayerStyle('water-infrastructure', (feature) => {
          if (feature.properties.asset_id === update.asset_id) {
            return pipeStyle({ ...feature, properties: update });
          }
          return pipeStyle(feature);
        });
      } catch (e) {
        console.error('Failed to process MQTT update:', e);
      }
    };

    subscribe('water/sensors/#', messageHandler);
    return () => unsubscribe('water/sensors/#', messageHandler);
  }, [enableMonitoring, isConnected, subscribe, unsubscribe, updateLayerStyle, pipeStyle]);

  // Layer initialization and cleanup
  useEffect(() => {
    if (!processedData) return;

    const geoJsonLayer = new L.GeoJSON(processedData, {
      style: pipeStyle,
      onEachFeature: (feature, layer) => {
        try {
          const analysis = hydraulicAnalysis(feature);
          layer.bindPopup(WaterResourcePopup(feature, analysis));
          
          if (enableMonitoring) {
            layer.on('click', () => {
              client.publish(`water/inspect/${feature.properties.asset_id}`, '1');
            });
          }
        } catch (error) {
          console.error('Feature initialization error:', error);
          layer.bindPopup('<div>Error loading asset data</div>');
        }
      }
    });

    geoJsonLayer
      .setZIndex(zIndex)
      .setMinZoom(minZoom)
      .setMaxZoom(maxZoom);

    addLayer('water-infrastructure', geoJsonLayer);
    setLayerInstance(geoJsonLayer);

    return () => {
      removeLayer('water-infrastructure');
      geoJsonLayer.off();
    };
  }, [processedData, enableMonitoring, client, addLayer, removeLayer, zIndex, minZoom, maxZoom, pipeStyle]);

  // Error handling
  if (mqttError) {
    return <LayerErrorBoundary error={new Error('Real-time monitoring unavailable')} />;
  }

  if (!processedData) {
    return <LayerErrorBoundary error={new Error('Invalid water infrastructure data')} />;
  }

  return layerInstance ? (
    <GeoJSON 
      data={processedData}
      style={pipeStyle}
      eventHandlers={{
        add: (e) => {
          e.target.setStyle(pipeStyle);
          if (enableMonitoring) {
            e.target.eachLayer(l => l.openPopup());
          }
        }
      }}
    />
  ) : null;
});

WaterResourcesLayer.propTypes = {
  infrastructureData: PropTypes.shape({
    type: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(
      PropTypes.shape({
        properties: PropTypes.object.isRequired,
        geometry: PropTypes.object.isRequired
      })
    ).isRequired
  }).isRequired,
  enableMonitoring: PropTypes.bool,
  styleOverrides: PropTypes.object,
  maxZoom: PropTypes.number,
  minZoom: PropTypes.number,
  zIndex: PropTypes.number
};

export default WaterResourcesLayer;