/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

const styles = {
    pdfViewer: {
      border: '1px solid rgba(0, 0, 0, 0.3)',
      borderRadius: '4px',
      height: '600px',
      width: '100%',
      overflow: 'hidden',
      margin: '16px 0'
    },
    officeViewer: {
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      margin: '16px 0',
      minHeight: '600px'
    },
    emptyState: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '300px',
      border: '2px dashed #eee',
      borderRadius: '4px',
      color: '#999',
      fontSize: '1.2rem'
    },
    errorMessage: {
      color: '#d32f2f',
      padding: '16px',
      backgroundColor: '#fdecea',
      borderRadius: '4px',
      margin: '16px 0'
    }
  };
  
  export default styles;