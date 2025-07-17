/** @jsxRuntime classic */
/** @jsx React.createElement */

import  React, { useState, useEffect } from 'react';
import { highlightText } from '../utils/textUtils';
import { saveToLibrary } from '../services/libraryService';
import { trackUserAction } from '../analytics';

export const SearchResultItem = ({ 
  item, 
  onSelect, 
  highlightQuery = '',
  isSelected = false,
  showPreview = false
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this item is already saved in library
  useEffect(() => {
    const checkSavedStatus = async () => {
      const saved = await checkIfSaved(item.id);
      setIsSaved(saved);
    };
    checkSavedStatus();
  }, [item.id]);

  // Load preview content when needed
  useEffect(() => {
    if (showPreview && !isPreviewLoaded) {
      const loadPreview = async () => {
        try {
          const content = await fetchPreviewContent(item.previewUrl);
          setPreviewContent(content);
          setIsPreviewLoaded(true);
        } catch (error) {
          console.error('Failed to load preview:', error);
          setPreviewContent('Preview not available');
        }
      };
      loadPreview();
    }
  }, [showPreview, isPreviewLoaded, item.previewUrl]);

  const handleSaveToLibrary = async (e) => {
    e.stopPropagation();
    try {
      await saveToLibrary(item);
      setIsSaved(true);
      trackUserAction({
        type: 'save_resource',
        resourceId: item.id,
        resourceType: item.type
      });
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleRemoveFromLibrary = async (e) => {
    e.stopPropagation();
    try {
      await removeFromLibrary(item.id);
      setIsSaved(false);
      trackUserAction({
        type: 'remove_resource',
        resourceId: item.id
      });
    } catch (error) {
      console.error('Failed to remove:', error);
    }
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    trackUserAction({
      type: isExpanded ? 'collapse_result' : 'expand_result',
      resourceId: item.id
    });
  };

  const renderMetadata = () => (
    <div className="item-metadata">
      <span className="item-type">{item.type}</span>
      <span className="item-date">
        {new Date(item.date).toLocaleDateString()}
      </span>
      {item.jurisdiction && (
        <span className="item-jurisdiction">{item.jurisdiction}</span>
      )}
      {item.relevance && (
        <span className="item-relevance">
          Relevance: {Math.round(item.relevance * 100)}%
        </span>
      )}
    </div>
  );

  const renderActions = () => (
    <div className="item-actions">
      <button 
        onClick={isSaved ? handleRemoveFromLibrary : handleSaveToLibrary}
        className={`save-button ${isSaved ? 'saved' : ''}`}
      >
        {isSaved ? 'Saved ✓' : 'Save to Library'}
      </button>
      <button 
        onClick={toggleExpand}
        className="expand-button"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
      {item.sourceUrl && (
        <a 
          href={item.sourceUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="source-link"
          onClick={(e) => e.stopPropagation()}
        >
          View Source
        </a>
      )}
    </div>
  );

  const renderPreviewContent = () => {
    if (!showPreview) return null;
    
    return (
      <div className="preview-content">
        {isPreviewLoaded ? (
          <div dangerouslySetInnerHTML={{ 
            __html: highlightText(previewContent, highlightQuery) 
          }} />
        ) : (
          <div className="loading-preview">Loading preview...</div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`search-result-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(item)}
      aria-expanded={isExpanded}
    >
      <div className="item-header">
        <h3 
          dangerouslySetInnerHTML={{ 
            __html: highlightText(item.title, highlightQuery) 
          }} 
        />
        {renderMetadata()}
      </div>
      
      <div className="item-body">
        <p 
          className="item-summary"
          dangerouslySetInnerHTML={{ 
            __html: highlightText(item.summary, highlightQuery) 
          }} 
        />
        
        {isExpanded && renderPreviewContent()}
      </div>
      
      {renderActions()}
      
      {item.relatedItems?.length > 0 && isExpanded && (
        <div className="related-items">
          <h4>Related Resources:</h4>
          <ul>
            {item.relatedItems.map(related => (
              <li key={related.id}>
                <a 
                  href={`#${related.id}`} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(related);
                  }}
                >
                  {related.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Helper functions (would typically be in separate service files)
async function checkIfSaved(itemId) {
  // Implementation would check user's library
  return false;
}

async function fetchPreviewContent(url) {
  // Implementation would fetch preview content
  return 'Sample preview content...';
}

async function removeFromLibrary(itemId) {
  // Implementation would remove from user's library
}