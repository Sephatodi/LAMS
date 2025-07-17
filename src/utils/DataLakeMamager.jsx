// /src/utils/DataLakeManager.jsx
import {
    Storage as DataLakeIcon,
    Dataset as DatasetIcon,
    CloudDownload as ExportIcon,
    CloudUpload as ImportIcon,
    Schema as SchemaIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Divider,
    InputAdornment,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useGetDataLakeQuery } from '../../api/dataApi';

const DataLakeManager = () => {
  const { data: datasets = [], isLoading } = useGetDataLakeQuery();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDatasets = datasets.filter(dataset => 
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dataset.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <DataLakeIcon sx={{ mr: 1 }} /> Data Lake Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search datasets..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        <Box>
          <Button startIcon={<ImportIcon />} sx={{ mr: 1 }}>Import</Button>
          <Button startIcon={<ExportIcon />}>Export</Button>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="All Datasets" icon={<DatasetIcon />} />
        <Tab label="Data Models" icon={<SchemaIcon />} />
      </Tabs>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ maxHeight: 'calc(100% - 150px)', overflow: 'auto' }}>
          {filteredDatasets.map((dataset, index) => (
            <React.Fragment key={dataset.id}>
              <ListItem>
                <ListItemText
                  primary={dataset.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {dataset.description}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        {dataset.recordCount} records • Updated: {new Date(dataset.updatedAt).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Chip 
                    label={dataset.format} 
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {dataset.size}
                  </Typography>
                </Box>
              </ListItem>
              {index < filteredDatasets.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default DataLakeManager;