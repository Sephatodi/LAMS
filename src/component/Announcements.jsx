//** @jsxRuntime classic */
/** @jsx React.createElement */

import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, Container, ListGroup, Spinner } from "react-bootstrap";
import { MegaphoneFill } from "react-bootstrap-icons";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = React.useCallback(async () => {
    try {
      if (import.meta.env.MODE === 'development') {
        // Use mock data in development
        setAnnouncements([
          {
            id: 1,
            title: "System Maintenance Scheduled",
            description: "The system will be unavailable on Saturday from 2:00 AM to 4:00 AM for scheduled maintenance.",
            date: "2023-06-15"
          },
          {
            id: 2,
            title: "New Application Features",
            description: "We've added new features to the land application process. Check them out in the application portal.",
            date: "2023-06-10"
          },
          {
            id: 3,
            title: "Public Holiday Closure",
            description: "Our offices will be closed on Independence Day, July 30th. Online services will remain available.",
            date: "2023-06-05"
          }
        ]);
      } else {
        const response = await axios.get("/api/announcements");
        setAnnouncements(response.data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setError("Error fetching announcements. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchAnnouncements]);

  if (loading) {
    return (
      <Container className="text-center my-5 py-4">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading announcements...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center">
          {error}
          <div className="mt-2">
            <button 
              onClick={fetchAnnouncements} 
              className="btn btn-sm btn-outline-danger"
            >
              Retry
            </button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="mb-4 text-primary">
        <MegaphoneFill className="me-2" />
        Public Announcements
      </h2>
      
      {announcements.length === 0 ? (
        <Alert variant="info" className="text-center">
          No announcements available at this time.
        </Alert>
      ) : (
        <ListGroup>
          {announcements.map((announcement) => (
            <ListGroup.Item 
              key={announcement.id} 
              className="mb-3 rounded shadow-sm"
              action
            >
              <div className="d-flex justify-content-between align-items-start">
                <h3 className="h5 mb-2">{announcement.title}</h3>
                <small className="text-muted">
                  {new Date(announcement.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </small>
              </div>
              <p className="mb-1">{announcement.description}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      
      {import.meta.env.MODE === 'development' && announcements.length > 0 && (
        <Alert variant="warning" className="mt-3 small">
          <strong>Development Note:</strong> Using mock data. In production, this would fetch from the API.
        </Alert>
      )}
    </Container>
  );
};

export default Announcements;