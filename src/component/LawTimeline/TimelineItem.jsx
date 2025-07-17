/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import styles from './styles.module.css';

const TimelineItem = ({ event }) => {
  return (
    <div className={`${styles.timelineCard} ${styles[event.eventType]}`}>
      <div className={styles.cardHeader}>
        <h3>{event.title}</h3>
        <div className={styles.eventDate}>
          {new Date(event.date).toLocaleDateString()}
          {event.endDate && ` → ${new Date(event.endDate).toLocaleDateString()}`}
        </div>
      </div>
      
      <p className={styles.eventDescription}>{event.description}</p>
      
      <div className={styles.cardFooter}>
        {event.link && (
          <a href={event.link} target="_blank" rel="noopener noreferrer">
            View Details
          </a>
        )}
        {event.tags && (
          <div className={styles.tags}>
            {event.tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineItem;