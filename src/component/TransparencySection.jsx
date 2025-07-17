/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import VerifiedIcon from '@mui/icons-material/Verified';
import { Box, Link, List, ListItem, ListItemText, Typography } from '@mui/material';

const TransparencySection = ({ logs }) => (
  <Box sx={{ mt: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
    <Typography variant="h6" sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      Recent System Activities
    </Typography>
    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
      {logs.map((log) => (
        <ListItem key={log.id} divider>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {log.verified && <VerifiedIcon color="success" sx={{ mr: 1 }} />}
                {log.action}
              </Box>
            }
            secondary={
              <>
                {new Date(log.timestamp).toLocaleString()} - {log.details}
                {log.txHash && (
                  <Link 
                    href={`https://blockscan.gov.bw/tx/${log.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ ml: 1 }}
                  >
                    View on Blockchain
                  </Link>
                )}
              </>
            }
            secondaryTypographyProps={{ variant: 'caption', component: 'div' }}
          />
        </ListItem>
      ))}
    </List>
  </Box>
);

export default TransparencySection;