/** @jsxRuntime classic */
/** @jsx React.createElement */

import React, { useCallback, useEffect, useState } from 'react';

const useNotifications = (initialNotifications = []) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      const mockNotifications = [
        { id: 1, message: 'New land application submitted', time: new Date(), read: false, type: 'application', status: 'new' },
        { id: 2, message: 'System maintenance scheduled', time: new Date(), read: true, type: 'system', status: 'info' }
      ];
      setNotifications(mockNotifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};

export default useNotifications;