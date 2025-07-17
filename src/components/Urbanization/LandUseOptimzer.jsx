// /src/components/Urbanization/LandUseOptimizer.jsx
import {
    Add as AddIcon,
    Business as CommercialIcon,
    Park as GreenIcon,
    AutoFixHigh as OptimizeIcon,
    Home as ResidentialIcon,
    Map as ZoneIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Slider,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useGetLandUsePlansQuery, useOptimizeLandUseMutation } from '../../api/urbanApi';

const LandUseOptimizer = () => {
  const { data: plans = [], isLoading } = useGetLandUsePlansQuery();
  const [optimizeLandUse] = useOptimizeLandUseMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [optimizationParams, setOptimizationParams] = useState({
    residential: 40,
    commercial: 30,
    green: 20,
    infrastructure: 10
  });

  const handleOptimize = async () => {
    try {
      await optimizeLandUse(optimizationParams).unwrap();
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  const handleParamChange = (type, value) => {
    setOptimizationParams(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <ZoneIcon sx={{ mr: 1 }} /> Land Use Optimization
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<OptimizeIcon />}
          onClick={handleOptimize}
        >
          Run Optimization
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Plan
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ maxHeight: 'calc(100% - 100px)', overflow: 'auto' }}>
          {plans.map((plan, index) => (
            <React.Fragment key={plan.id}>
              <ListItem>
                <ListItemText
                  primary={plan.areaName}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {plan.totalArea} hectares • {plan.populationDensity} people/ha
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        Last updated: {new Date(plan.updatedAt).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`${plan.residentialPercent}% Residential`}
                    icon={<ResidentialIcon />}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    label={`${plan.commercialPercent}% Commercial`}
                    icon={<CommercialIcon />}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip 
                    label={`${plan.greenPercent}% Green`}
                    icon={<GreenIcon />}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </ListItem>
              {index < plans.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Optimization Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Land Use Optimization Parameters</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Set target percentages for land use types (must total 100%)
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              Residential: {optimizationParams.residential}%
            </Typography>
            <Slider
              value={optimizationParams.residential}
              onChange={(e, newValue) => handleParamChange('residential', newValue)}
              min={10}
              max={60}
              valueLabelDisplay="auto"
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              Commercial: {optimizationParams.commercial}%
            </Typography>
            <Slider
              value={optimizationParams.commercial}
              onChange={(e, newValue) => handleParamChange('commercial', newValue)}
              min={10}
              max={50}
              valueLabelDisplay="auto"
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              Green Space: {optimizationParams.green}%
            </Typography>
            <Slider
              value={optimizationParams.green}
              onChange={(e, newValue) => handleParamChange('green', newValue)}
              min={5}
              max={40}
              valueLabelDisplay="auto"
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              Infrastructure: {optimizationParams.infrastructure}%
            </Typography>
            <Slider
              value={optimizationParams.infrastructure}
              onChange={(e, newValue) => handleParamChange('infrastructure', newValue)}
              min={5}
              max={30}
              valueLabelDisplay="auto"
            />
          </Box>
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
            Current total: {Object.values(optimizationParams).reduce((a, b) => a + b, 0)}%
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              handleOptimize();
              setOpenDialog(false);
            }}
            disabled={Object.values(optimizationParams).reduce((a, b) => a + b, 0) !== 100}
          >
            Run Optimization
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LandUseOptimizer;