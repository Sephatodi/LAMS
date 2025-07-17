/* eslint-disable react-refresh/only-export-components */
/** @jsxRuntime classic */
/** @jsx React.createElement */

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ToastContext = createContext();

// Helper functions moved outside the component
const getToastStyle = (type) => {
  const baseStyle = 'p-4 rounded-lg shadow-lg text-white flex items-center';
  const types = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    default: 'bg-gray-600'
  };
  return `${baseStyle} ${types[type] || types.default}`;
};

const getPositionStyle = (position) => {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };
  return positions[position] || positions['top-right'];
};

const getIcon = (type) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || '💡';
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const id = uuidv4();
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      position: options.position || 'top-right'
    };

    setToasts((prev) => [...prev, toast]);

    const timer = setTimeout(() => {
      dismissToast(id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [dismissToast]); // Added dismissToast to dependencies

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue = useMemo(() => ({
    showToast,
    dismissToast,
    clearAllToasts
  }), [showToast, dismissToast, clearAllToasts]);

  const groupedToasts = useMemo(() => 
    toasts.reduce((acc, toast) => {
      if (!acc[toast.position]) acc[toast.position] = [];
      acc[toast.position].push(toast);
      return acc;
    }, {}),
  [toasts]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed z-50 space-y-2">
        {Object.entries(groupedToasts).map(([position, positionToasts]) => (
          <div key={position} className={`fixed space-y-2 ${getPositionStyle(position)}`}>
            {positionToasts.map((toast) => (
              <div
                key={toast.id}
                className={`${getToastStyle(toast.type)} animate-fadeInUp`}
                role={toast.type === 'error' ? 'alert' : 'status'}
              >
                <span className="mr-2 text-xl">{getIcon(toast.type)}</span>
                <span>{toast.message}</span>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="ml-4 hover:opacity-75"
                  aria-label="Close notification"
                >
                  ×
                </button>
                {toast.duration > 0 && (
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-white/30 animate-progress"
                    style={{ animationDuration: `${toast.duration}ms` }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Create a separate file for this hook if you want to completely resolve the first warning
export const useToast = () => new useContext(ToastContext);