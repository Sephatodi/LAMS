/** @jsxRuntime classic */
/** @jsx React.createElement */
import  React from 'react';
import { Box, Link, List, ListItem, ListItemText, Typography } from "@mui/material";


const Resources = () => {
  const resources = [
    { name: "Land Policy Document", link: "/documents/land-policy.pdf" },
    { name: "Application Guidelines", link: "/documents/guidelines.pdf" },
    { name: "Dispute Resolution Process", link: "/documents/dispute-process.pdf" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Land-Related Documents and Resources
      </Typography>
      <List>
        {resources.map((resource, index) => (
          <ListItem key={index}>
            <Link href={resource.link} download>
              <ListItemText primary={resource.name} />
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Resources;