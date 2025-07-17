// src/components/ConflictDetectionMap.jsx
import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const isValidGeoJSON = (geoJson) => {
  if (!geoJson) return false;
  if (!geoJson.type) return false;
  if (geoJson.type === 'FeatureCollection' && !Array.isArray(geoJson.features)) return false;
  return true;
};

const ConflictDetectionMap = ({ height = 300, onConflictSelect }) => {
  // Sample valid conflict data
  const conflictData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { 
          id: 1, 
          type: "boundary",
          name: "Sample Boundary Dispute"
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [25.90, -24.65],
              [25.91, -24.65],
              [25.91, -24.66],
              [25.90, -24.66],
              [25.90, -24.65]
            ]
          ]
        }
      }
    ]
  };

  if (!isValidGeoJSON(conflictData)) {
    console.error("Invalid GeoJSON data:", conflictData);
    return <div>Error loading conflict data</div>;
  }

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer 
        center={[-24.658, 25.908]} 
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        <GeoJSON
          data={conflictData}
          style={(feature) => ({
            color: feature?.properties?.type === 'boundary' ? 'red' : 'orange',
            weight: 3,
            fillOpacity: 0.2
          })}
          onEachFeature={(feature, layer) => {
            if (feature.properties && onConflictSelect) {
              layer.on({
                click: () => onConflictSelect(feature.properties)
              });
            }
          }}
        />
      </MapContainer>
    </div>
  );
};

export default ConflictDetectionMap;