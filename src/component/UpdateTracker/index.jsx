/** @jsxRuntime classic */
/** @jsx React.createElement */

import  React, { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

export const UpdateTracker = () => {
  const {
    updates,
    status,
    error,
    unreadCount,
    markAsRead,
    reconnect
  } = useWebSocket('wss://your-api/updates');
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        markAsRead();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [markAsRead]);

  const handleNotificationClick = () => {
    markAsRead();
    // Scroll to first unread update
    document.querySelector('.update-item.unread')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className={`update-tracker ${status}`}>
      <div className="tracker-header">
        <h3>Legal Updates Tracker</h3>
        
        <div className="status-controls">
          <span className={`connection-status ${status}`}>
            {status.toUpperCase()}
          </span>
          
          {status !== 'connected' && (
            <button onClick={reconnect} className="reconnect-button">
              Reconnect
            </button>
          )}
          
          {unreadCount > 0 && (
            <button 
              onClick={handleNotificationClick}
              className="unread-badge"
            >
              {unreadCount} New Updates
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error} - Updates may be delayed
        </div>
      )}
      
      <div className="updates-feed">
        {updates.length === 0 ? (
          <div className="empty-state">
            {status === 'connecting' 
              ? 'Connecting to update feed...' 
              : 'No updates received yet'}
          </div>
        ) : (
          updates.map((update, index) => (
            <div 
              key={update.id} 
              className={`update-item ${index < unreadCount ? 'unread' : ''}`}
            >
              <div className="update-header">
                <span className={`priority-${update.priority}`}>
                  {update.priority} Priority
                </span>
                <span className="update-time">
                  {new Date(update.timestamp).toLocaleString()}
                </span>
              </div>
              
              <h4 className="update-title">{update.title}</h4>
              
              <div className="update-body">
                <p>{update.description}</p>
                {update.affectedLaws?.length > 0 && (
                  <div className="affected-laws">
                    <strong>Affected Laws:</strong>
                    <ul>
                      {update.affectedLaws.map(law => (
                        <li key={law.id}>{law.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="update-actions">
                <button className="action-button">View Details</button>
                <button className="action-button">Save to Library</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};