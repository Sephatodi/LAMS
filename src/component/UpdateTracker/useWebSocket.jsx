/** @jsxRuntime classic */
/** @jsx React.createElement */

import  React, { useEffect, useRef, useState } from 'react';

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000;
const HEARTBEAT_INTERVAL = 30000;

export const useWebSocket = (url) => {
  const [state, setState] = useState({
    updates: [],
    status: 'connecting',
    error: null,
    unreadCount: 0
  });
  
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const heartbeatTimer = useRef();
  const messageQueue = useRef([]);

  const connect = useCallback(() => {
    setState(prev => ({ ...prev, status: 'connecting' }));
    
    ws.current = new WebSocket(url);
    
    ws.current.onopen = () => {
      reconnectAttempts.current = 0;
      setState(prev => ({ ...prev, status: 'connected' }));
      
      // Process any queued messages
      if (messageQueue.current.length > 0) {
        messageQueue.current.forEach(msg => {
          setState(prev => ({
            updates: [msg, ...prev.updates.slice(0, 99)],
            unreadCount: prev.unreadCount + 1
          }));
        });
        messageQueue.current = [];
      }
      
      // Start heartbeat
      heartbeatTimer.current = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, HEARTBEAT_INTERVAL);
    };
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'heartbeat') return;
        
        setState(prev => ({
          updates: [data, ...prev.updates.slice(0, 99)],
          unreadCount: prev.unreadCount + 1
        }));
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };
    
    ws.current.onerror = (error) => {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'WebSocket error'
      }));
    };
    
    ws.current.onclose = () => {
      clearInterval(heartbeatTimer.current);
      
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1;
        setTimeout(connect, RECONNECT_INTERVAL);
      } else {
        setState(prev => ({ ...prev, status: 'disconnected' }));
      }
    };
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      clearInterval(heartbeatTimer.current);
    };
  }, [url]);

  const markAsRead = () => {
    setState(prev => ({ ...prev, unreadCount: 0 }));
  };

  useEffect(() => {
    connect();
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      clearInterval(heartbeatTimer.current);
    };
  }, [connect]);

  // Fallback polling when WebSocket fails
  useEffect(() => {
    if (state.status === 'disconnected') {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${url}/poll`);
          const data = await response.json();
          messageQueue.current = [...messageQueue.current, data];
        } catch (err) {
          console.error('Polling failed:', err);
        }
      }, 10000);
      
      return () => clearInterval(pollInterval);
    }
  }, [state.status, url]);

  return { ...state, markAsRead, reconnect: connect };
};