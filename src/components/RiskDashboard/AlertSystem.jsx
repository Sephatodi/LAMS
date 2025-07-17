/** @jsxRuntime classic */
/** @jsx React.createElement */

// src/components/AlertSystem.js
import React, { useEffect, useState } from 'react';
import { useFraudDetection } from '../hooks/useFraudDetection';
import ImmutableLogger from '../security/audit/ImmutableLogger';

const AlertSystem = ({ mapView }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribeToAlerts, acknowledgeAlert } = useFraudDetection();

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const initialAlerts = await subscribeToAlerts();
        setAlerts(initialAlerts);
        setLoading(false);
        
        await ImmutableLogger.logEvent(
          'ALERTS_ACCESSED',
          { count: initialAlerts.length },
          'system'
        );
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadAlerts();
  }, [subscribeToAlerts]);

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      
      await ImmutableLogger.logEvent(
        'ALERT_ACKNOWLEDGED',
        { alertId },
        'user'
      );

      // If we have a map view, zoom to the alert location before removing
      if (mapView && alerts.find(a => a.id === alertId)?.location) {
        const alert = alerts.find(a => a.id === alertId);
        mapView.goTo({
          center: alert.location,
          zoom: 16
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEscalate = async (alertId) => {
    try {
      await ImmutableLogger.logEvent(
        'ALERT_ESCALATED',
        { alertId },
        'user'
      );
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading-spinner">Loading alerts...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="alert-system-container">
      <h2>Land Use Monitoring Alerts</h2>
      <div className="alert-count">
        {alerts.length} active {alerts.length === 1 ? 'alert' : 'alerts'}
      </div>
      
      <div className="alert-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">No active alerts</div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`alert-item ${getAlertClass(alert.severity)}`}>
              <div className="alert-header">
                <span className="alert-title">{alert.title}</span>
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="alert-body">
                <p>{alert.description}</p>
                <div className="alert-meta">
                  <span className="alert-score">Risk Score: {alert.score}</span>
                  <span className="alert-source">Source: {alert.source}</span>
                  {alert.location && (
                    <button 
                      className="btn-locate"
                      onClick={() => mapView.goTo({
                        center: alert.location,
                        zoom: 16
                      })}
                    >
                      View Location
                    </button>
                  )}
                </div>
              </div>
              <div className="alert-actions">
                <button 
                  className="btn-acknowledge"
                  onClick={() => handleAcknowledge(alert.id)}
                >
                  Acknowledge
                </button>
                <button 
                  className="btn-escalate"
                  onClick={() => handleEscalate(alert.id)}
                >
                  Escalate
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const getAlertClass = (severity) => {
  switch (severity) {
    case 'critical': return 'alert-critical';
    case 'high': return 'alert-high';
    case 'medium': return 'alert-medium';
    default: return 'alert-low';
  }
};

export default AlertSystem;