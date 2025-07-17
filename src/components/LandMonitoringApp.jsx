/** @jsxRuntime classic */
/** @jsx React.createElement */


import React, { useState } from 'react';
import ArcGISMap from './component/ArcGISMap';
import AlertSystem from './components/RiskDashboard/AlertSystem';

const LandMonitoringApp = () => {
  const [mapView, setMapView] = useState(null);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 3 }}>
        <ArcGISMap 
          onMapLoad={setMapView}
          enableGeofenceAlerts={true}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <AlertSystem mapView={mapView} />
      </div>
    </div>
  );
};

export default LandMonitoringApp;