/** @jsxRuntime classic */
/** @jsx React.createElement */


import { Alert, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import  React, { useCallback, useEffect, useState } from 'react';
import { GeoJSON, LayersControl, MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import ParcelDetailsPanel from './ParcelDetailsPanel';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const StyledMapContainer = styled(MapContainer)({
  height: '100%',
  width: '100%',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
});

const LandParcelMap = () => {
  const [parcels, setParcels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [map, setMap] = useState(null);

  const fetchParcels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/parcels');
      setParcels(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load parcel data');
      console.error('Error fetching parcels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  const handleParcelClick = (e, feature) => {
    setSelectedParcel(feature.properties);
    if (map) {
      map.fitBounds(e.target.getBounds());
    }
  };

  const parcelStyle = (feature) => {
    return {
      fillColor: getStatusColor(feature.properties.status),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const getStatusColor = (status) => {
    const statusColors = {
      allocated: '#e74c3c',
      available: '#2ecc71',
      disputed: '#f39c12',
      reserved: '#3498db',
      government: '#9b59b6'
    };
    return statusColors[status] || '#95a5a6';
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: (e) => handleParcelClick(e, feature)
    });

    const popupContent = `
      <div>
        <h4>Parcel ${feature.properties.parcelNumber}</h4>
        <p><strong>Status:</strong> ${feature.properties.status}</p>
        <p><strong>Area:</strong> ${feature.properties.area.toLocaleString()} m²</p>
        <p><strong>Owner:</strong> ${feature.properties.owner || 'Government'}</p>
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress size={50} />
    </Box>
  );

  if (error) return (
    <Alert severity="error" sx={{ m: 2 }}>
      {error}
    </Alert>
  );

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <StyledMapContainer
        center={[-24.658, 25.908]}
        zoom={13}
        whenCreated={setMap}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {parcels && (
          <GeoJSON
            data={parcels}
            style={parcelStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </StyledMapContainer>

      {selectedParcel && (
        <ParcelDetailsPanel 
          parcel={selectedParcel} 
          onClose={() => setSelectedParcel(null)}
        />
      )}
    </Box>
  );
};

export default LandParcelMap;