/** @jsxRuntime classic */
/** @jsx React.createElement */
// src/components/maps/MapWrapper.jsx
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';
import  React, { useEffect } from 'react';
import { MapContainer } from 'react-leaflet';

const MapWrapper = ({ 
  children, 
  center = [-24.658, 25.908], // Default to Gaborone
  zoom = 13,
  style = { height: '100%', width: '100%' },
  whenCreated,
  zoomControl = true,
  attributionControl = true,
  maxZoom = 19,
  minZoom = 8,
  className = ''
}) => {
  // Fix for default marker icons - Botswana specific customization
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
      iconSize: [25, 41], // Slightly larger for better visibility
      iconAnchor: [12, 41]
    });
    
    // Botswana-specific CRS configuration
    L.CRS.EPSG3857.transformation = new L.Transformation(
      1, 0,
      -1, 0
    );
  }, []);

  return (
    <MapContainer 
      center={center}
      zoom={zoom}
      style={style}
      whenCreated={whenCreated}
      zoomControl={zoomControl}
      attributionControl={attributionControl}
      maxZoom={maxZoom}
      minZoom={minZoom}
      className={`botswana-map ${className}`}
      crs={L.CRS.EPSG3857} // Standard Web Mercator projection
    >
      {children}
    </MapContainer>
  );
};

MapWrapper.propTypes = {
  children: PropTypes.node,
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
  style: PropTypes.object,
  whenCreated: PropTypes.func,
  zoomControl: PropTypes.bool,
  attributionControl: PropTypes.bool,
  maxZoom: PropTypes.number,
  minZoom: PropTypes.number,
  className: PropTypes.string
};

export default MapWrapper;