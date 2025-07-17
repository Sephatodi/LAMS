/** @jsxRuntime classic */
/** @jsx React.createElement */

import { useRef, useEffect } from 'react';
import { useLawUpdates } from './useLawUpdates';

export const LawUpdates = ({ jurisdiction }) => {
  const {
    updates,
    loading,
    error,
    filters,
    hasMore,
    applyFilters,
    loadMore
  } = useLawUpdates(jurisdiction);
  
  const observer = useRef();
  const lastUpdateRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className="law-updates-container">
      <div className="filters-section">
        <select
          value={filters.category}
          onChange={e => applyFilters({ category: e.target.value })}
        >
          <option value="all">All Categories</option>
          <option value="tax">Tax Laws</option>
          <option value="labor">Labor Laws</option>
        </select>
        
        <select
          value={filters.dateRange}
          onChange={e => applyFilters({ dateRange: e.target.value })}
        >
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="lastYear">Last Year</option>
        </select>
      </div>

      {error && <div className="error-alert">{error}</div>}
      
      <div className="updates-grid">
        {updates.map((update, index) => (
          <div 
            key={update.id} 
            ref={index === updates.length - 1 ? lastUpdateRef : null}
            className="update-card"
          >
            <h3>{update.title}</h3>
            <div className="badges">
              <span className="category-badge">{update.category}</span>
              <span className="date-badge">
                {new Date(update.effectiveDate).toLocaleDateString()}
              </span>
            </div>
            <p>{update.summary}</p>
            <button className="details-button">View Details</button>
          </div>
        ))}
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}
      {!hasMore && <div className="end-message">No more updates to show</div>}
    </div>
  );
};