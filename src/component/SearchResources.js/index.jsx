/** @jsxRuntime classic */
/** @jsx React.createElement */

import  React, { useState, useEffect, useCallback } from 'react';
import { SearchResultItem } from './SearchResultItem';
import { trackSearch } from '../analytics';

const DEBOUNCE_DELAY = 300;

export const SearchResources = ({ resources = [], onSelect }) => {
  const [state, setState] = useState({
    query: '',
    filteredResources: [],
    activeFilters: {
      type: 'all',
      dateRange: 'anytime',
      jurisdiction: 'all'
    },
    isSearching: false
  });

  const debounceTimer = useRef();

  const filterResources = useCallback(() => {
    const { query, activeFilters } = state;
    
    return resources.filter(resource => {
      const matchesQuery = 
        resource.title.toLowerCase().includes(query.toLowerCase()) ||
        resource.description.toLowerCase().includes(query.toLowerCase()) ||
        resource.content.toLowerCase().includes(query.toLowerCase());
      
      const matchesType = 
        activeFilters.type === 'all' || 
        resource.type === activeFilters.type;
      
      const matchesJurisdiction = 
        activeFilters.jurisdiction === 'all' || 
        resource.jurisdiction === activeFilters.jurisdiction;
      
      return matchesQuery && matchesType && matchesJurisdiction;
    });
  }, [state.query, state.activeFilters, resources]);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    
    if (state.query.trim() === '') {
      setState(prev => ({ ...prev, filteredResources: [], isSearching: false }));
      return;
    }

    setState(prev => ({ ...prev, isSearching: true }));
    
    debounceTimer.current = setTimeout(() => {
      const results = filterResources();
      setState(prev => ({
        ...prev,
        filteredResources: results,
        isSearching: false
      }));
      
      // Track search analytics
      trackSearch({
        query: state.query,
        resultCount: results.length,
        filters: state.activeFilters
      });
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimer.current);
  }, [state.query, state.activeFilters, filterResources]);

  const handleFilterChange = (filterName, value) => {
    setState(prev => ({
      ...prev,
      activeFilters: {
        ...prev.activeFilters,
        [filterName]: value
      }
    }));
  };

  return (
    <div className="advanced-search-container">
      <div className="search-controls">
        <input
          type="search"
          placeholder="Search legal resources..."
          value={state.query}
          onChange={e => setState(prev => ({ ...prev, query: e.target.value }))}
          className="search-input"
        />
        
        <div className="filter-dropdowns">
          <select
            value={state.activeFilters.type}
            onChange={e => handleFilterChange('type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="statute">Statutes</option>
            <option value="case">Case Law</option>
            <option value="regulation">Regulations</option>
          </select>
          
          <select
            value={state.activeFilters.jurisdiction}
            onChange={e => handleFilterChange('jurisdiction', e.target.value)}
          >
            <option value="all">All Jurisdictions</option>
            <option value="federal">Federal</option>
            <option value="state">State</option>
          </select>
        </div>
      </div>

      {state.isSearching && (
        <div className="search-status">Searching...</div>
      )}

      <div className="results-container">
        {state.filteredResources.length > 0 ? (
          <div className="results-grid">
            {state.filteredResources.map(item => (
              <SearchResultItem 
                key={item.id} 
                item={item} 
                onSelect={onSelect}
                highlightQuery={state.query}
              />
            ))}
          </div>
        ) : state.query && !state.isSearching ? (
          <div className="no-results">
            No matching resources found. Try different search terms or filters.
          </div>
        ) : (
          <div className="search-prompt">
            <h3>Legal Resource Search</h3>
            <p>Enter search terms above to find statutes, case law, and regulations</p>
            <div className="search-tips">
              <h4>Search Tips:</h4>
              <ul>
                <li>Use quotes for exact phrases: "employment discrimination"</li>
                <li>Prefix with 'title:' to search titles only</li>
                <li>Filter by jurisdiction or document type</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};