/** @jsxRuntime classic */
/** @jsx React.createElement */


import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';
import  React, { useCallback, useEffect, useState } from 'react';
import { GeoJSON, MapContainer, Polygon, Popup, TileLayer, useMap } from 'react-leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/**
 * Map Controller Component (Internal)
 */
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

/**
 * Enhanced Land Parcel Visualization Component with GeoServer Integration
 */
export const LandParcelMap = ({ 
  landParcelId,
  showGoogleMap = false,
  onParcelSelect,
  initialCenter = [-22.3285, 24.6849],
  initialZoom = 6
}) => {
  const [landParcel, setLandParcel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geoServerData, setGeoServerData] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);

  // Fetch data from GeoServer
  const fetchGeoServerData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:8080/geoserver/nlms/ows', 
        {
          params: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: 'nlms:land_parcels',
            outputFormat: 'application/json'
          },
          timeout: 10000
        }
      );
      setGeoServerData(response.data);
    } catch (error) {
      console.error("Error fetching GeoServer data:", error);
      setError(error.message);
    }
  }, []);

  // Fetch specific land parcel data
  const fetchLandParcel = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/map/land-parcel/${landParcelId}`, {
        timeout: 10000,
      });
      
      if (!response.data?.coordinates) {
        throw new Error('Invalid land parcel data format');
      }
      
      setLandParcel(response.data);
    } catch (error) {
      console.error("Error fetching land parcel:", error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [landParcelId]);

  useEffect(() => {
    if (landParcelId) {
      fetchLandParcel();
    } else {
      // Load default GeoServer data if no specific parcel ID
      fetchGeoServerData();
    }
  }, [landParcelId, fetchLandParcel, fetchGeoServerData]);

  // Handle feature selection
  const handleFeatureClick = useCallback((feature) => {
    setActiveFeature(feature);
    if (onParcelSelect) {
      onParcelSelect(feature);
    }
  }, [onParcelSelect]);

  // Style function for GeoJSON features
  const styleFeature = useCallback((feature) => {
    const isActive = activeFeature && activeFeature.id === feature.id;
    return {
      color: isActive ? '#ff0000' : '#3388ff',
      weight: isActive ? 3 : 2,
      opacity: 1,
      fillColor: isActive ? '#ff0000' : '#3388ff',
      fillOpacity: isActive ? 0.4 : 0.2
    };
  }, [activeFeature]);

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {landParcelId ? 'Land Parcel Details' : 'Botswana Land Parcels'}
      </Typography>

      {showGoogleMap && landParcel?.coordinates && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Google Maps View
          </Typography>
          <GoogleMap 
            center={{ 
              lat: landParcel.coordinates[0][0], 
              lng: landParcel.coordinates[0][1] 
            }} 
            zoom={14}
            markerTitle="Parcel Location"
          />
        </Box>
      )}

      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: "500px", width: "100%" }}
        scrollWheelZoom={true}
        doubleClickZoom={false}
      >
        <MapController center={initialCenter} zoom={initialZoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render specific land parcel if available */}
        {landParcel && (
          <Polygon 
            positions={landParcel.coordinates} 
            pathOptions={{ color: 'blue', fillOpacity: 0.4 }}
          >
            <Popup>
              <Box>
                <Typography variant="h6">Land Parcel {landParcelId}</Typography>
                {landParcel.plots && (
                  <Typography>Total Plots: {landParcel.plots.length}</Typography>
                )}
              </Box>
            </Popup>
          </Polygon>
        )}

        {/* Render plots if available */}
        {landParcel?.plots?.map((plot) => (
          <Polygon 
            key={plot.plotId} 
            positions={plot.coordinates} 
            pathOptions={{ color: 'green', fillOpacity: 0.4 }}
          >
            <Popup>
              <Box>
                <Typography variant="h6">Plot {plot.plotId}</Typography>
                <Typography>Size: {plot.size} sqm</Typography>
                <Typography>Zoning: {plot.zoning}</Typography>
              </Box>
            </Popup>
          </Polygon>
        ))}

        {/* Render GeoServer data if no specific parcel */}
        {!landParcelId && geoServerData && (
          <GeoJSON
            data={geoServerData}
            style={styleFeature}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: () => handleFeatureClick(feature)
              });
            }}
          />
        )}
      </MapContainer>

      {/* Display active feature details */}
      {activeFeature && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <Typography variant="h6">Selected Parcel Details</Typography>
          <Typography>ID: {activeFeature.id}</Typography>
          {activeFeature.properties && Object.entries(activeFeature.properties).map(([key, value]) => (
            <Typography key={key}>{key}: {value}</Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

LandParcelMap.propTypes = {
  landParcelId: PropTypes.string,
  showGoogleMap: PropTypes.bool,
  onParcelSelect: PropTypes.func,
  initialCenter: PropTypes.arrayOf(PropTypes.number),
  initialZoom: PropTypes.number,
};

/**
 * Interactive Polygon Drawing Component
 */
export const PolygonDrawingMap = ({ onLandSubmit, initialCenter = [51.505, -0.09] }) => {
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setPolygonCoordinates(prev => [...prev, [lat, lng]]);
  };

  const handleSubmit = async () => {
    if (polygonCoordinates.length < 3) {
      return alert('Please draw a valid polygon with at least 3 points.');
    }

    try {
      setSubmitting(true);
      await onLandSubmit(polygonCoordinates);
      setPolygonCoordinates([]);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setPolygonCoordinates([]);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Draw the land area by clicking on the map to create a polygon
      </Typography>
      
      <MapContainer
        center={initialCenter}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
        onClick={handleMapClick}
        doubleClickZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {polygonCoordinates.length > 0 && (
          <Polygon
            positions={polygonCoordinates}
            pathOptions={{ color: 'blue', fillColor: 'lightblue', fillOpacity: 0.4 }}
          />
        )}
      </MapContainer>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={polygonCoordinates.length < 3 || submitting}
        >
          {submitting ? <CircularProgress size={24} /> : 'Submit Land Area'}
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleReset}
          disabled={polygonCoordinates.length === 0}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

PolygonDrawingMap.propTypes = {
  onLandSubmit: PropTypes.func.isRequired,
  initialCenter: PropTypes.arrayOf(PropTypes.number),
};

/**
 * Conflict Detection Map Component
 */
export const ConflictDetectionMap = ({ height = 300, onConflictSelect, conflictData }) => {
  const isValidGeoJSON = useCallback((geoJson) => {
    if (!geoJson) return false;
    if (!geoJson.type) return false;
    if (geoJson.type === 'FeatureCollection' && !Array.isArray(geoJson.features)) return false;
    return true;
  }, []);

  if (!isValidGeoJSON(conflictData)) {
    console.error("Invalid GeoJSON data:", conflictData);
    return (
      <Alert severity="error" sx={{ height }}>
        Invalid conflict data format
      </Alert>
    );
  }

  const handleFeatureClick = (feature) => {
    if (onConflictSelect && feature?.properties) {
      onConflictSelect(feature.properties);
    }
  };

  return (
    <Box sx={{ height, width: '100%' }}>
      <MapContainer 
        center={[-24.658, 25.908]} 
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
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
            layer.on({
              click: () => handleFeatureClick(feature)
            });
          }}
        />
      </MapContainer>
    </Box>
  );
};

ConflictDetectionMap.propTypes = {
  height: PropTypes.number,
  onConflictSelect: PropTypes.func,
  conflictData: PropTypes.object,
};