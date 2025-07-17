/** @jsxRuntime classic */
/** @jsx React.createElement */

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import QGISIntegration from '../../gis/qgis/QGISIntegration';
import { useFraudDetection } from '../../hooks/useFraudDetection';
import './RiskMap.css';

const RiskMap = ({ region }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getFraudRisks } = useFraudDetection();

  useEffect(() => {
    // Initialize map
    const leafletMap = L.map(mapRef.current).setView(
      [region.center.lat, region.center.lng], 
      10
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMap);

    // Add QGIS base layers
    const adminLayer = QGISIntegration.getWMSLayer('administrative');
    adminLayer.addTo(leafletMap);

    setMap(leafletMap);

    return () => {
      leafletMap.remove();
    };
  }, [region]);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const risks = await getFraudRisks(region.id);
        setRiskData(risks);
        
        // Add risk markers to map
        if (map) {
          risks.forEach(risk => {
            const color = getColorForRisk(risk.score);
            const marker = L.circleMarker(
              [risk.location.lat, risk.location.lng],
              {
                radius: 10,
                fillColor: color,
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              }
            ).addTo(map);
            
            marker.bindPopup(
              `<strong>Risk Score: ${risk.score}</strong><br>
              ${risk.description}<br>
              <small>Last updated: ${new Date(risk.timestamp).toLocaleString()}</small>`
            );
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load risk data:', error);
        setLoading(false);
      }
    };

    if (map) {
      fetchRiskData();
    }
  }, [map, region.id, getFraudRisks]);

  const getColorForRisk = (score) => {
    if (score >= 80) return '#ff0000';
    if (score >= 60) return '#ff6600';
    if (score >= 40) return '#ffcc00';
    if (score >= 20) return '#ffff00';
    return '#00ff00';
  };

  return (
    <div className="risk-map-container">
      <div className="map-header">
        <h2>Fraud Risk Assessment - {region.name}</h2>
        <div className="risk-legend">
          <div className="legend-item">
            <span className="legend-color high-risk"></span>
            <span>High Risk (80-100)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color medium-risk"></span>
            <span>Medium Risk (60-79)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color low-risk"></span>
            <span>Low Risk (0-59)</span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading risk data...</div>
      ) : (
        <div ref={mapRef} className="risk-map"></div>
      )}
      
      <div className="risk-summary">
        <h3>Risk Summary</h3>
        <div className="summary-stats">
          <div className="stat-item high-risk">
            <span className="stat-count">
              {riskData.filter(r => r.score >= 80).length}
            </span>
            <span className="stat-label">High Risk</span>
          </div>
          <div className="stat-item medium-risk">
            <span className="stat-count">
              {riskData.filter(r => r.score >= 60 && r.score < 80).length}
            </span>
            <span className="stat-label">Medium Risk</span>
          </div>
          <div className="stat-item low-risk">
            <span className="stat-count">
              {riskData.filter(r => r.score < 60).length}
            </span>
            <span className="stat-label">Low Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMap;