/** @jsxRuntime classic */
/** @jsx React.createElement */

import { Box, Tab, Tabs } from '@mui/material';
import  React, { useEffect, useState } from 'react';
import  useApi  from '../hooks/useApi';
import AllocationQueue from './AllocationQueue';
import AllocationTable from './AllocationTable';

const LandAllocationSystem = () => {
  const api = useApi();
  
  // State for tab system
  const [activeSystemTab, setActiveSystemTab] = useState('map');
  const [queueData, setQueueData] = useState([]);
  
  // GIS related state
  const [gisData, setGisData] = useState(null);
  const [selectedApplicationLocation, setSelectedApplicationLocation] = useState(null);

  // Fetch queue data
  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        const response = await api.get('/allocations/queue');
        setQueueData(response.data);
      } catch (err) {
        console.error('Failed to fetch queue data:', err);
      }
    };
    fetchQueueData();
  }, [api]);

  // Fetch GIS data
  useEffect(() => {
    const fetchGisData = async () => {
      try {
        const response = await api.get('/gis/available-parcels');
        setGisData(response.data);
      } catch (err) {
        console.error('Failed to fetch GIS data:', err);
      }
    };
    fetchGisData();
  }, [api]);

  const showApplicationLocation = (application) => {
    setSelectedApplicationLocation({
      coordinates: application.location?.coordinates || [],
      ward: application.preferredWard,
      village: application.preferredVillage
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Tab System */}
      <Tabs 
        value={activeSystemTab} 
        onChange={(e, v) => setActiveSystemTab(v)}
        sx={{ mb: 3 }}
      >
        <Tab label="Map View" value="map" />
        <Tab label="Allocation Queue" value="queue" />
        <Tab label="Approved Allocations" value="approved" />
      </Tabs>

      {/* Tab Content */}
      {activeSystemTab === 'map' && (
        <Box>
          {/* Existing map content */}
          {selectedApplicationLocation && (
            <Box sx={{ height: 500 }}>
              <MapContainer 
                center={selectedApplicationLocation.coordinates[0] || [-24.658, 25.908]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {gisData && (
                  <GeoJSON 
                    data={gisData} 
                    style={{ color: 'green', fillOpacity: 0.2 }}
                  />
                )}
                {selectedApplicationLocation.coordinates.length > 0 && (
                  <GeoJSON 
                    data={{
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: selectedApplicationLocation.coordinates
                      }
                    }}
                    pointToLayer={(feature, latlng) => {
                      return L.circleMarker(latlng, {
                        radius: 8,
                        fillColor: 'red',
                        color: '#fff',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                      });
                    }}
                  />
                )}
              </MapContainer>
            </Box>
          )}
        </Box>
      )}

      {activeSystemTab === 'queue' && (
        <AllocationQueue 
          data={queueData} 
          onRefresh={() => {
            const fetchQueueData = async () => {
              try {
                const response = await api.get('/allocations/queue');
                setQueueData(response.data);
              } catch (err) {
                console.error('Failed to fetch queue data:', err);
              }
            };
            fetchQueueData();
          }}
          onShowLocation={showApplicationLocation}
        />
      )}

      {activeSystemTab === 'approved' && (
        <AllocationTable 
          showOnlyApproved={true}
          onShowLocation={showApplicationLocation}
        />
      )}
    </Box>
  );
};

export default LandAllocationSystem;