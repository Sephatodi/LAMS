 
 
import { Box, Tab, Tabs, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import AllocationQueue from "./AllocationQueue";
import Announcements from "./Announcements";
import LandRecords from "./LandRecords";

const PublicPortal = ({ applicantId }) => {
  const [tabValue, setTabValue] = useState(0);
  const [applicationStatus, setApplicationStatus] = useState("");
  const [allocatedPlot, setAllocatedPlot] = useState(null);

  useEffect(() => {
    if (applicantId) {
      axios
        .get(`/api/applications/status/${applicantId}`)
        .then((response) => {
          setApplicationStatus(response.data.status);
          setAllocatedPlot(response.data.allocatedPlot);
        })
        .catch((error) => {
          console.error("Error fetching application status:", error);
        });
    }
  }, [applicantId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Public Portal
      </Typography>

      {/* Application Status Section */}
      {applicantId && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Application Status
          </Typography>
          <Typography>Status: {applicationStatus}</Typography>
          {allocatedPlot && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Allocated Plot</Typography>
              <Typography>Plot ID: {allocatedPlot.plotId}</Typography>
              <Typography>Location: {allocatedPlot.location}</Typography>
              <Typography>Size: {allocatedPlot.size} sqm</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Tabs Navigation */}
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Allocation Queue" />
        <Tab label="Land Records" />
        <Tab label="Announcements" />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && (
          <AllocationQueue applicantId={applicantId} />
        )}
        {tabValue === 1 && (
          <LandRecords applicantId={applicantId} />
        )}
        {tabValue === 2 && (
          <Announcements />
        )}
      </Box>
    </Box>
  );
};

export default PublicPortal;