/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import styles from './styles.module.css';

const TimelineFilters = ({ 
  searchQuery, 
  onSearchChange,
  onZoomIn,
  onZoomOut,
  onResetZoom
}) => {
  return (
    <div className={styles.filterContainer}>
      <input
        type="text"
        placeholder="Search timeline..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />
      
      <div className={styles.zoomControls}>
        <button onClick={onZoomIn} className={styles.zoomButton}>
          <span>+</span>
        </button>
        <button onClick={onResetZoom} className={styles.zoomButton}>
          <span>↻</span>
        </button>
        <button onClick={onZoomOut} className={styles.zoomButton}>
          <span>-</span>
        </button>
      </div>
    </div>
  );
};

export default TimelineFilters;