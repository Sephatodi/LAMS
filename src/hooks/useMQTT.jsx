/** @jsxRuntime classic */
/** @jsx React.createElement */

import mqtt from 'mqtt';
import React, { useCallback, useEffect, useState } from 'react';

const useMQTT = (brokerUrl, options = {}) => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({});

  // Connect to MQTT broker
  const connect = useCallback(() => {
    try {
      const mqttClient = mqtt.connect(brokerUrl, {
        reconnectPeriod: 5000,
        ...options
      });

      mqttClient.on('connect', () => {
        setIsConnected(true);
        setError(null);
      });

      mqttClient.on('error', (err) => {
        setError(err);
        setIsConnected(false);
      });

      mqttClient.on('message', (topic, payload) => {
        setMessage({
          topic,
          payload: tryParsePayload(payload)
        });
      });

      mqttClient.on('close', () => {
        setIsConnected(false);
      });

      setClient(mqttClient);
    } catch (err) {
      setError(err);
    }
  }, [brokerUrl, options]);

  // Disconnect from MQTT broker
  const disconnect = useCallback(() => {
    if (client) {
      client.end(false, () => {
        setIsConnected(false);
        setClient(null);
      });
    }
  }, [client]);

  // Subscribe to topics
  const subscribe = useCallback((topic, callback) => {
    if (client && isConnected) {
      client.subscribe(topic, (err) => {
        if (err) {
          setError(err);
        }
      });

      if (callback) {
        client.on('message', (receivedTopic, payload) => {
          if (topicMatchesSubscription(topic, receivedTopic)) {
            callback({
              topic: receivedTopic,
              payload: tryParsePayload(payload)
            });
          }
        });
      }
    }
  }, [client, isConnected]);

  // Unsubscribe from topics
  const unsubscribe = useCallback((topic) => {
    if (client && isConnected) {
      client.unsubscribe(topic);
    }
  }, [client, isConnected]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Helper function to parse MQTT payload
  const tryParsePayload = (payload) => {
    try {
      return JSON.parse(payload.toString());
    } catch {
      return payload.toString();
    }
  };

  // Helper function for topic matching
  const topicMatchesSubscription = (subscription, receivedTopic) => {
    if (subscription === receivedTopic) return true;
    if (subscription.includes('#')) {
      const subParts = subscription.split('/');
      const topicParts = receivedTopic.split('/');
      
      for (let i = 0; i < subParts.length; i++) {
        if (subParts[i] === '#') return true;
        if (subParts[i] !== topicParts[i] && subParts[i] !== '+') {
          return false;
        }
      }
    }
    return false;
  };

  return {
    client,
    isConnected,
    error,
    message,
    connect,
    disconnect,
    subscribe,
    unsubscribe
  };
};

export default useMQTT;