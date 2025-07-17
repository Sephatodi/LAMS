/** @jsxRuntime classic */
/** @jsx React.createElement */

import  React, { useEffect, useRef, useState } from 'react';
import { Timeline } from 'vis-timeline';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import TimelineItem from './TimelineItem';
import TimelineFilters from './TimelineFilters';
import styles from './styles.module.css';

const LawTimeline = ({ events }) => {
  const timelineRef = useRef(null);
  const timelineInstance = useRef(null);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [zoomLevel, setZoomLevel] = useState('auto');
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize timeline
  useEffect(() => {
    if (!timelineRef.current) return;

    timelineInstance.current = new Timeline(
      timelineRef.current,
      filteredEvents.map(event => ({
        id: event.id,
        content: TimelineItem({ event }),
        start: new Date(event.date),
        end: event.endDate ? new Date(event.endDate) : undefined,
        type: event.eventType || 'default',
        className: styles[event.eventType] || styles.defaultEvent
      })),
      {
        zoomable: true,
        showCurrentTime: true,
        orientation: 'top',
        zoomMin: 1000 * 60 * 60 * 24 * 30, // 1 month in ms
        zoomMax: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        template: (item) => TimelineItem({ event: item }),
        onZoom: (props) => setZoomLevel(props.scale)
      }
    );

    return () => {
      if (timelineInstance.current) {
        timelineInstance.current.destroy();
      }
    };
  }, [filteredEvents]);

  // Apply filters and search
  useEffect(() => {
    let results = events;
    
    // Apply search
    if (searchQuery) {
      results = results.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(results);
  }, [events, searchQuery]);

  // Zoom controls
  const handleZoom = (direction) => {
    if (!timelineInstance.current) return;
    const currentZoom = timelineInstance.current.getWindow();
    const range = currentZoom.end - currentZoom.start;
    const newRange = direction === 'in' ? range * 0.8 : range * 1.2;
    
    timelineInstance.current.zoom({
      start: currentZoom.start,
      end: currentZoom.start + newRange
    });
  };

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineControls}>
        <TimelineFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onZoomIn={() => handleZoom('in')}
          onZoomOut={() => handleZoom('out')}
          onResetZoom={() => timelineInstance.current.fit()}
        />
        
        <div className={styles.zoomLevel}>
          Current zoom: {zoomLevel}
        </div>
      </div>

      <div ref={timelineRef} className={styles.visTimeline} />
      
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legislation}`} />
          Legislation
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.amendment}`} />
          Amendment
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.decision}`} />
          Court Decision
        </div>
      </div>
    </div>
  );
};

export default LawTimeline;