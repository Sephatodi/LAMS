/** @jsxRuntime classic */
/** @jsx React.createElement */

import React, { useEffect, useState } from 'react';
import QGISIntegration from '../../gis/qgis/QGISIntegration';
import { useBlockchain } from '../../hooks/useBlockchain';
import { useBiometricAuth } from '../../security/auth/BiometricAuth';
import './TitleViewer.css';

const TitleViewer = ({ titleId }) => {
  const [titleData, setTitleData] = useState(null);
  const [mapLayer, setMapLayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getTitleDetails } = useBlockchain();
  const { biometricAuth } = useBiometricAuth();

  useEffect(() => {
    const fetchTitleData = async () => {
      try {
        // Authenticate first
        await biometricAuth.authenticate(
          'Verify identity to access title deed'
        );

        // Get title from blockchain
        const data = await getTitleDetails(titleId);
        setTitleData(data);

        // Load parcel map from QGIS
        const layer = await QGISIntegration.queryFeatureInfo(
          'parcels',
          [data.center.lat, data.center.lng]
        );
        setMapLayer(layer);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTitleData();
  }, [titleId, getTitleDetails, biometricAuth]);

  if (loading) return <div className="loading-spinner">Loading title deed...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="title-viewer-container">
      <div className="title-details-section">
        <h2>Title Deed: {titleData.id}</h2>
        <div className="title-detail">
          <span className="detail-label">Owner:</span>
          <span className="detail-value">{titleData.owner}</span>
        </div>
        <div className="title-detail">
          <span className="detail-label">Area:</span>
          <span className="detail-value">{titleData.area} hectares</span>
        </div>
        <div className="title-detail">
          <span className="detail-label">Registered:</span>
          <span className="detail-value">
            {new Date(titleData.registeredDate).toLocaleDateString()}
          </span>
        </div>
        <div className="title-history">
          <h3>Ownership History</h3>
          <ul>
            {titleData.history.map((item, index) => (
              <li key={index}>
                {new Date(item.transactionDate).toLocaleDateString()} - 
                Transferred from {item.previousOwner} to {item.newOwner}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="title-map-section">
        <h3>Parcel Location</h3>
        <div className="map-container">
          {mapLayer && (
            <img 
              src={mapLayer.image} 
              alt="Parcel map" 
              className="parcel-map"
            />
          )}
        </div>
        <div className="map-actions">
          <button className="btn-print" onClick={() => window.print()}>
            Print Title Deed
          </button>
        </div>
      </div>
    </div>
  );
};

export default TitleViewer;