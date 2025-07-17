/** @jsxRuntime classic */
/** @jsx React.createElement */


import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-measure';
import 'leaflet-measure/dist/leaflet-measure.css';
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useAudit } from '../hooks/useAudit';

const BotswanaAnalysisTools = ({ onBufferAnalysis, userRole }) => {
  const map = useMap();
  const { logAction } = useAudit();

  useEffect(() => {
    if (!map) return;

    // Initialize measurement tool
    const measureControl = L.control.measure({
      primaryLengthUnit: 'meters',
      secondaryLengthUnit: 'kilometers',
      primaryAreaUnit: 'sqmeters',
      secondaryAreaUnit: 'hectares'
    }).addTo(map);

    // Initialize drawing tool
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: true,
        polyline: false,
        rectangle: true,
        circle: false,
        marker: false
      }
    });
    map.addControl(drawControl);

    // Add custom buffer analysis control for admins
    if (userRole === 'admin') {
      const BufferControl = L.Control.extend({
        onAdd: () => {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
          const button = L.DomUtil.create('a', '', container);
          button.innerHTML = '⏺️';
          button.title = 'Buffer Analysis';
          button.style.cursor = 'pointer';
          
          L.DomEvent.on(button, 'click', () => {
            onBufferAnalysis();
            logAction('buffer_tool_activated');
          });
          
          return container;
        }
      });
      
      new BufferControl({ position: 'topleft' }).addTo(map);
    }

    // Cleanup
    return () => {
      map.removeControl(measureControl);
      map.removeControl(drawControl);
    };
  }, [map, onBufferAnalysis, userRole, logAction]);

  return null;
};

export default BotswanaAnalysisTools;