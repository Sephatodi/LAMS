/** @jsxRuntime classic */
/** @jsx React.createElement */

import { CheckCircle, Flag, Public, Star, TrendingUp } from '@mui/icons-material';
import { Box, Chip, Divider, List, ListItem, ListItemIcon, Typography } from '@mui/material';

const SolutionHighlights = ({ solutions }) => {
  const features = [
    {
      icon: <Public color="primary" />,
      title: "Nationwide Coverage",
      description: "Comprehensive land management across all tribal regions"
    },
    {
      icon: <TrendingUp color="primary" />,
      title: "Growth-Oriented",
      description: "Supports Botswana's development goals and Vision 2036"
    },
    {
      icon: <Flag color="primary" />,
      title: "Tribal Integration",
      description: "Respects and incorporates traditional land governance"
    }
  ];

  return (
    <Box sx={{ 
      bgcolor: 'background.paper', 
      p: 3, 
      borderRadius: 2, 
      boxShadow: 1,
      border: '1px solid',
      borderColor: 'divider',
      maxWidth: 400
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CheckCircle color="primary" sx={{ mr: 1 }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          System Features & Benefits
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Key Features:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {features.map((feature, index) => (
            <Chip
              key={index}
              icon={feature.icon}
              label={feature.title}
              variant="outlined"
              size="small"
              sx={{ 
                borderRadius: 1,
                borderColor: 'primary.light',
                color: 'primary.dark'
              }}
            />
          ))}
        </Box>
      </Box>
      
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Success Stories:
      </Typography>
      
      <List dense sx={{ mt: 1 }}>
        {solutions.map((solution, index) => (
          <ListItem 
            key={index} 
            sx={{ 
              py: 0.5,
              '&:hover': {
                bgcolor: 'action.hover',
                borderRadius: 1
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Star color="secondary" fontSize="small" />
            </ListItemIcon>
            <Typography 
              variant="body1"
              sx={{ 
                fontWeight: 500,
                color: 'text.primary'
              }}
            >
              {solution}
            </Typography>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
        &quot;Empowering Botswana&apos;s land governance through digital transformation&quot;
      </Typography>
    </Box>
  );
};

export default SolutionHighlights;