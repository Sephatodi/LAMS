// /src/components/Urbanization/GrowthPredictor.jsx
import {
  Download as ExportIcon,
  Timeline as GrowthIcon,
  Map as MapIcon,
  ShowChart as ModelIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Slider,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useGetUrbanGrowthModelsQuery } from '../../api/urbanApi';
import GrowthMap from '../maps/GrowthMap';

const GrowthPredictor = () => {
  const { data: models = [], isLoading } = useGetUrbanGrowthModelsQuery();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedModel, setSelectedModel] = useState(null);
  const [timeHorizon, setTimeHorizon] = useState(10);
  const [growthRate, setGrowthRate] = useState(3.5);

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].id);
    }
  }, [models, selectedModel]);

  const currentModel = models.find(model => model.id === selectedModel);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <GrowthIcon sx={{ mr: 1 }} /> Urban Growth Prediction
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Prediction Model</InputLabel>
          <Select
            value={selectedModel || ''}
            onChange={(e) => setSelectedModel(e.target.value)}
            label="Prediction Model"
          >
            {models.map(model => (
              <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" display="block">
            Time Horizon: {timeHorizon} years
          </Typography>
          <Slider
            value={timeHorizon}
            onChange={(e, newValue) => setTimeHorizon(newValue)}
            min={5}
            max={30}
            step={5}
            valueLabelDisplay="auto"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" display="block">
            Growth Rate: {growthRate}% annually
          </Typography>
          <Slider
            value={growthRate}
            onChange={(e, newValue) => setGrowthRate(newValue)}
            min={1}
            max={10}
            step={0.5}
            valueLabelDisplay="auto"
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
        >
          Export
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Growth Map" icon={<MapIcon />} />
        <Tab label="Model Parameters" icon={<ModelIcon />} />
      </Tabs>

      {isLoading ? (
        <LinearProgress />
      ) : !currentModel ? (
        <Typography>No model selected</Typography>
      ) : activeTab === 0 ? (
        <Box sx={{ height: 500 }}>
          <GrowthMap 
            model={currentModel} 
            timeHorizon={timeHorizon}
            growthRate={growthRate}
          />
        </Box>
      ) : (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {currentModel.name} Parameters
          </Typography>
          <Typography variant="body2" paragraph>
            {currentModel.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Card sx={{ p: 2, flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Key Drivers
              </Typography>
              <List dense>
                {currentModel.keyDrivers.map((driver, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={driver} />
                  </ListItem>
                ))}
              </List>
            </Card>
            <Card sx={{ p: 2, flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Accuracy Metrics
              </Typography>
              <List dense>
                {Object.entries(currentModel.accuracyMetrics).map(([metric, value]) => (
                  <ListItem key={metric}>
                    <ListItemText 
                      primary={`${metric}: ${value}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default GrowthPredictor;