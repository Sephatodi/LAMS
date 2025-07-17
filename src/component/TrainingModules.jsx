/** @jsxRuntime classic */
/** @jsx React.createElement */

import { Download, ExpandMore, PlayCircle, Quiz } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    CardActions,
    Chip,
    CircularProgress,
    Container,
    Grid,
    Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TrainingModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  // Inside your component
const navigate = useNavigate();

  const fetchTrainingModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/training-modules');
      setModules(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch training modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingModules();
  }, []);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleStartModule = (moduleId) => {
  // Example implementation - navigate to module
  navigate(`/training/modules/${moduleId}`);
};

const handleDownloadMaterials = async (moduleId) => {
  try {
    const response = await fetch(`/api/materials/${moduleId}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `module-${moduleId}-materials.zip`;
    a.click();
  } catch (error) {
    console.error('Download failed:', error);
  }
};

const handleTakeQuiz = (moduleId) => {
  // Example implementation - open quiz in new tab
  window.open(`/training/quiz/${moduleId}`, '_blank');
};

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Training Modules
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Learn about land allocation policies, dispute resolution, and system usage
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {modules.map((module) => (
              <Grid item xs={12} key={module.id}>
                <Accordion 
                  expanded={expanded === module.id}
                  onChange={handleAccordionChange(module.id)}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {module.title}
                      </Typography>
                      <Chip 
                        label={module.difficulty} 
                        color={
                          module.difficulty === 'Beginner' ? 'success' : 
                          module.difficulty === 'Intermediate' ? 'warning' : 'error'
                        } 
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {module.duration} min
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography paragraph>
                      {module.description}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Learning Objectives:
                    </Typography>
                    <ul>
                      {module.objectives.map((obj, index) => (
                        <li key={index}>
                          <Typography variant="body2">{obj}</Typography>
                        </li>
                      ))}
                    </ul>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        startIcon={<PlayCircle />}
                        onClick={() => handleStartModule(module.id)}
                        sx={{ mr: 1 }}
                      >
                        Start Module
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => handleDownloadMaterials(module.id)}
                        sx={{ mr: 1 }}
                      >
                        Materials
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Quiz />}
                        onClick={() => handleTakeQuiz(module.id)}
                        disabled={!module.quizAvailable}
                      >
                        Take Quiz
                      </Button>
                    </CardActions>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default TrainingModules;