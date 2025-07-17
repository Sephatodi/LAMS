/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useState, useEffect, useCallback } from 'react';
import ImmutableLogger from '../security/audit/ImmutableLogger';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for fraud detection in land parcel monitoring
 * @returns {Object} Fraud detection methods and state
 */
const useFraudDetection = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  /**
   * Subscribe to fraud detection alerts
   * @param {Function} callback - Function to call when new alert is detected
   * @returns {Function} Cleanup function to unsubscribe
   */
  const subscribeToAlerts = useCallback((callback) => {
    if (!user?.permissions?.includes('view_alerts')) {
      console.warn('User does not have permission to view alerts');
      return () => {};
    }

    setIsMonitoring(true);
    ImmutableLogger.logEvent('FRAUD_MONITORING_STARTED', {}, user.id);

    // Mock event source - replace with actual WebSocket or API connection
    const eventSource = {
      addEventListener: (type, listener) => {
        // Simulate random alerts (replace with real connection)
        const interval = setInterval(() => {
          // Only generate alerts 10% of the time
          if (Math.random() < 0.1) {
            const mockAlert = generateMockAlert();
            listener({ data: JSON.stringify(mockAlert) });
          }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
      }
    };

    const handleAlert = (event) => {
      try {
        const alertData = JSON.parse(event.data);
        setAlerts(prev => [...prev, alertData]);
        if (callback) callback(alertData);
        
        ImmutableLogger.logEvent(
          'NEW_FRAUD_ALERT', 
          { alertId: alertData.id, type: alertData.type },
          user.id
        );
      } catch (error) {
        console.error('Error processing alert:', error);
      }
    };

    eventSource.addEventListener('alert', handleAlert);

    return () => {
      setIsMonitoring(false);
      // In a real implementation, you would clean up the actual event source here
      ImmutableLogger.logEvent('FRAUD_MONITORING_STOPPED', {}, user.id);
    };
  }, [user]);

  /**
   * Acknowledge an alert and remove it from state
   * @param {string} alertId - ID of the alert to acknowledge
   */
  const acknowledgeAlert = useCallback(async (alertId) => {
    try {
      // In a real implementation, this would call your backend API
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      ImmutableLogger.logEvent(
        'ALERT_ACKNOWLEDGED', 
        { alertId }, 
        user.id
      );
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      ImmutableLogger.logEvent(
        'ALERT_ACKNOWLEDGE_FAILED', 
        { alertId, error: error.message }, 
        user.id
      );
    }
  }, [user]);

  // Generate a mock fraud alert for development
  const generateMockAlert = () => {
    const alertTypes = [
      {
        type: 'DUPLICATE_PARCEL',
        title: 'Duplicate Land Parcel Detected',
        description: 'Potential duplicate registration of the same land parcel',
        severity: 'high',
        score: 90
      },
      {
        type: 'UNUSUAL_ACTIVITY',
        title: 'Unusual Activity Detected',
        description: 'Unexpected changes to land parcel boundaries',
        severity: 'medium',
        score: 70
      },
      {
        type: 'UNAUTHORIZED_TRANSFER',
        title: 'Unauthorized Transfer Attempt',
        description: 'Attempt to transfer land parcel without proper authorization',
        severity: 'critical',
        score: 95
      }
    ];

    const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const coordinates = [
      23.5 + Math.random() * 2 - 1, // Random longitude near Botswana
      -22.5 + Math.random() * 2 - 1  // Random latitude near Botswana
    ];

    return {
      id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...randomType,
      coordinates,
      timestamp: new Date().toISOString(),
      source: 'Automated Monitoring System'
    };
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setIsMonitoring(false);
    };
  }, []);

  return {
    alerts,
    isMonitoring,
    subscribeToAlerts,
    acknowledgeAlert,
    clearAlerts: () => setAlerts([])
  };
};
// src/hooks/useFraudDetection.jsx
export default useFraudDetection;