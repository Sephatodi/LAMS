// src/component/ActivityTimeline.js
import { History } from '@mui/icons-material';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { format } from 'date-fns';
import React from 'react';

const ActivityTimeline = ({ activities }) => {
  return (
    <List sx={{ maxHeight: 500, overflow: 'auto' }}>
      {activities.map((activity, index) => (
        <ListItem key={index} sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
          <Box sx={{ mr: 2, color: 'text.secondary' }}>
            <History />
          </Box>
          <ListItemText
            primary={activity.action}
            secondary={
              <>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                  sx={{ display: 'block' }}
                >
                  {format(new Date(activity.timestamp), 'PPpp')}
                </Typography>
                {activity.details && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    {JSON.stringify(activity.details)}
                  </Typography>
                )}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ActivityTimeline;