/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

const styles = {
    timelineContainer: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    visTimeline: {
      height: '600px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      marginTop: '20px'
    },
    timelineControls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '15px'
    },
    filterContainer: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    searchInput: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      minWidth: '250px'
    },
    zoomControls: {
      display: 'flex',
      gap: '5px'
    },
    zoomButton: {
      background: '#f0f0f0',
      border: 'none',
      borderRadius: '4px',
      width: '32px',
      height: '32px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&:hover': {
        background: '#e0e0e0'
      }
    },
    zoomLevel: {
      color: '#666',
      fontSize: '0.9em'
    },
    timelineCard: {
      background: '#fff',
      borderRadius: '4px',
      padding: '12px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      maxWidth: '300px'
    },
    legislation: {
      borderLeft: '4px solid #3498db'
    },
    amendment: {
      borderLeft: '4px solid #2ecc71'
    },
    decision: {
      borderLeft: '4px solid #e74c3c'
    },
    cardHeader: {
      marginBottom: '8px'
    },
    eventDate: {
      color: '#7f8c8d',
      fontSize: '0.85em'
    },
    eventDescription: {
      color: '#34495e',
      fontSize: '0.9em',
      margin: '8px 0'
    },
    cardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '10px',
      fontSize: '0.85em'
    },
    tags: {
      display: 'flex',
      gap: '5px',
      flexWrap: 'wrap'
    },
    tag: {
      background: '#f0f0f0',
      padding: '2px 6px',
      borderRadius: '3px',
      fontSize: '0.75em'
    },
    legend: {
      display: 'flex',
      gap: '15px',
      marginTop: '15px',
      justifyContent: 'center'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '0.85em'
    },
    legendDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%'
    },
    defaultEvent: {
      borderLeft: '4px solid #95a5a6'
    }
  };
  
  export default styles;