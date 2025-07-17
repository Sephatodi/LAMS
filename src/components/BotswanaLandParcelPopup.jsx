/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import { Box, Button, Divider, Typography } from '@mui/material';
import { Popup } from 'react-leaflet';

const BotswanaLandParcelPopup = ({ feature, userRole }) => {
  return (
    <Popup maxWidth={300}>
      <Box sx={{ p: 1 }}>
        <Typography variant="h6">
          Plot {feature.properties.plotNumber}
        </Typography>
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="body2">
          <strong>Status:</strong> {feature.properties.status}
        </Typography>
        <Typography variant="body2">
          <strong>Area:</strong> {feature.properties.area} m²
        </Typography>
        <Typography variant="body2">
          <strong>Tribal Land:</strong> {feature.properties.tribalLand}
        </Typography>
        
        {userRole === 'admin' && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2">
              <strong>Owner:</strong> {feature.properties.owner}
            </Typography>
            <Typography variant="body2">
              <strong>Certificate:</strong> {feature.properties.certificateNumber}
            </Typography>
          </>
        )}
        
        <Button 
          variant="outlined" 
          size="small" 
          fullWidth
          sx={{ mt: 1 }}
          onClick={() => window.open(`/parcels/${feature.properties.id}`)}
        >
          View Details
        </Button>
      </Box>
    </Popup>
  );
};

export default BotswanaLandParcelPopup;