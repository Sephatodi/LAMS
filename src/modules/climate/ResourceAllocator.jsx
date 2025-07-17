// /src/modules/climate/ResourceAllocator.jsx
import {
    ShowChart as AllocationIcon,
    Balance as BalanceIcon,
    Grass as GrazingIcon,
    Water as WaterIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Slider,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useGetResourceAllocationsQuery, useUpdateAllocationMutation } from '../../api/climateApi';

const ResourceAllocator = () => {
  const { data: allocations = [], isLoading } = useGetResourceAllocationsQuery();
  const [updateAllocation] = useUpdateAllocationMutation();
  const [activeTab, setActiveTab] = useState(0);
  const [adjustmentValues, setAdjustmentValues] = useState({});

  useEffect(() => {
    if (allocations.length > 0) {
      const initialValues = {};
      allocations.forEach(allocation => {
        initialValues[allocation.id] = allocation.currentAllocation;
      });
      setAdjustmentValues(initialValues);
    }
  }, [allocations]);

  const handleAllocationChange = (id, value) => {
    setAdjustmentValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveAllocation = async (id) => {
    try {
      await updateAllocation({
        id,
        newAllocation: adjustmentValues[id]
      }).unwrap();
    } catch (error) {
      console.error('Failed to update allocation:', error);
    }
  };

  const filteredAllocations = allocations.filter(allocation => 
    activeTab === 0 ? allocation.resourceType === 'water' : allocation.resourceType === 'grazing'
  );

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <BalanceIcon sx={{ mr: 1 }} /> Resource Allocation System
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Water Rights" icon={<WaterIcon />} />
        <Tab label="Grazing Rights" icon={<GrazingIcon />} />
      </Tabs>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ maxHeight: 'calc(100% - 100px)', overflow: 'auto' }}>
          {filteredAllocations.map((allocation, index) => (
            <React.Fragment key={allocation.id}>
              <ListItem>
                <ListItemText
                  primary={allocation.areaName}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {allocation.community} • {allocation.allocationType}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        Historical range: {allocation.minAllocation} - {allocation.maxAllocation} {allocation.unit}
                      </Typography>
                    </>
                  }
                />
                <Box sx={{ width: 300 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">
                      {allocation.minAllocation} {allocation.unit}
                    </Typography>
                    <Typography variant="caption">
                      Current: {allocation.currentAllocation} {allocation.unit}
                    </Typography>
                    <Typography variant="caption">
                      {allocation.maxAllocation} {allocation.unit}
                    </Typography>
                  </Box>
                  <Slider
                    value={adjustmentValues[allocation.id] || allocation.currentAllocation}
                    onChange={(e, newValue) => handleAllocationChange(allocation.id, newValue)}
                    min={allocation.minAllocation}
                    max={allocation.maxAllocation}
                    step={allocation.stepSize || 1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} ${allocation.unit}`}
                    sx={{ mt: 1 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AllocationIcon />}
                    onClick={() => handleSaveAllocation(allocation.id)}
                    sx={{ mt: 1, width: '100%' }}
                  >
                    Update Allocation
                  </Button>
                </Box>
              </ListItem>
              {index < filteredAllocations.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ResourceAllocator;