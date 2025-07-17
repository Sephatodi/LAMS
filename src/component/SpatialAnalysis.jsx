/** @jsxRuntime classic */
/** @jsx React.createElement */


import { styled } from '@mui/material/styles';
import L from 'leaflet';
import  React, { useMemo } from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';

const BufferTooltip = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  fontSize: '0.875rem',
  fontWeight: 500,
  minWidth: '200px',
}));

const BufferAnalysis = ({ 
  center, 
  distance, 
  features = [],
  onFeatureClick,
  bufferColor = '#1976d2',
  featureColor = '#4caf50',
  centerColor = '#ff9800'
}) => {
  // Create buffer zone visualization
  const bufferZone = useMemo(() => {
    if (!center || !distance) return null;
    
    // Get center coordinates
    const centerCoords = center.geometry.type === 'Point' 
      ? [center.geometry.coordinates[1], center.geometry.coordinates[0]]
      : [
          center.geometry.coordinates[0][0][1], 
          center.geometry.coordinates[0][0][0]
        ];

    // Create a circle to represent the buffer zone
    return L.circle(centerCoords, {
      radius: distance,
      color: bufferColor,
      fillColor: bufferColor,
      fillOpacity: 0.2,
      weight: 2
    }).toGeoJSON();
  }, [center, distance, bufferColor]);

  // Calculate statistics
  const { totalArea, landUseCount } = useMemo(() => {
    return features.reduce((acc, feature) => {
      const area = feature.properties?.area || 0;
      acc.totalArea += area;
      
      const landUse = feature.properties?.landUse || 'unknown';
      acc.landUseCount[landUse] = (acc.landUseCount[landUse] || 0) + 1;
      
      return acc;
    }, { 
      totalArea: 0, 
      landUseCount: {} 
    });
  }, [features]);

  if (!center || !center.geometry) return null;

  return (
    <>
      {/* Buffer zone visualization */}
      {bufferZone && (
        <GeoJSON
          key="buffer-zone"
          data={bufferZone}
          style={{
            color: bufferColor,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.2,
            fillColor: bufferColor,
            dashArray: '5, 5'
          }}
        >
          <Tooltip permanent direction="top">
            <BufferTooltip>
              <div><strong>Buffer Zone Analysis</strong></div>
              <div>Radius: {distance.toLocaleString()} meters</div>
              <div>Parcels Found: {features.length}</div>
              <div>Total Area: {totalArea.toLocaleString()} m²</div>
              {Object.keys(landUseCount).length > 0 && (
                <div>
                  <strong>Land Use Distribution:</strong>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                    {Object.entries(landUseCount).map(([use, count]) => (
                      <li key={use}>
                        {use.charAt(0).toUpperCase() + use.slice(1)}: {count}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </BufferTooltip>
          </Tooltip>
        </GeoJSON>
      )}

      {/* Features within buffer zone */}
      {features.map((feature, idx) => {
        const properties = feature.properties || {};
        return (
          <GeoJSON
            key={`buffer-feature-${idx}`}
            data={feature}
            style={{
              color: featureColor,
              weight: 2,
              opacity: 1,
              fillOpacity: 0.5,
              fillColor: featureColor
            }}
            eventHandlers={{
              click: () => onFeatureClick && onFeatureClick(feature)
            }}
          >
            <Tooltip direction="top" permanent={features.length <= 10}>
              <div>
                <strong>Plot {properties.plotNumber || 'N/A'}</strong>
              </div>
              <div>Status: {properties.status || 'N/A'}</div>
              <div>Land Use: {properties.landUse || 'N/A'}</div>
              <div>Area: {properties.area?.toLocaleString() || 'N/A'} m²</div>
              <div>Value: {properties.valuePerSqm ? 
                `BWP ${(properties.valuePerSqm * properties.area).toLocaleString()}` : 'N/A'}
              </div>
            </Tooltip>
          </GeoJSON>
        );
      })}

      {/* Center feature highlight */}
      <GeoJSON
        key="buffer-center"
        data={center}
        style={{
          color: centerColor,
          weight: 3,
          opacity: 1,
          fillOpacity: 0.2,
          fillColor: centerColor
        }}
      >
        <Tooltip permanent direction="top">
          <BufferTooltip>
            <div><strong>Center Plot</strong></div>
            {center.properties && (
              <>
                <div>Plot: {center.properties.plotNumber || 'N/A'}</div>
                <div>Status: {center.properties.status || 'N/A'}</div>
                <div>Land Use: {center.properties.landUse || 'N/A'}</div>
                <div>Area: {center.properties.area?.toLocaleString() || 'N/A'} m²</div>
              </>
            )}
          </BufferTooltip>
        </Tooltip>
      </GeoJSON>
    </>
  );
};

// Named export
export { BufferAnalysis };

// Default export
export default BufferAnalysis;