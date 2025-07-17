// /src/utils/MobileFieldKit.jsx
import {
    CameraAlt as CameraIcon,
    Description as FormIcon,
    GpsFixed as GPSIcon,
    Map as MapIcon,
    PhoneIphone as MobileIcon,
    CloudOff as OfflineIcon,
    Cloud as OnlineIcon,
    Sync as SyncIcon
} from '@mui/icons-material';
import {
    Badge,
    Box,
    Button,
    Card,
    Chip,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Switch,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useGetFieldDataQuery, useSyncFieldDataMutation } from '../../api/fieldApi';

const MobileFieldKit = () => {
  const { data: fieldData = [], isLoading, refetch } = useGetFieldDataQuery();
  const [syncData] = useSyncFieldDataMutation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const count = fieldData.filter(item => !item.synced).length;
    setUnsyncedCount(count);
  }, [fieldData]);

  const handleSync = async () => {
    try {
      const unsyncedItems = fieldData.filter(item => !item.synced);
      await syncData(unsyncedItems).unwrap();
      refetch();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <MobileIcon sx={{ mr: 1 }} /> Mobile Field Kit
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Chip 
          label={isOnline ? 'Online' : 'Offline'} 
          color={isOnline ? 'success' : 'default'}
          icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
          variant="outlined"
        />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Offline Mode:
          </Typography>
          <Switch 
            checked={offlineMode}
            onChange={(e) => setOfflineMode(e.target.checked)}
            color="primary"
          />
        </Box>
        <Badge badgeContent={unsyncedCount} color="error">
          <Button
            variant="contained"
            startIcon={<SyncIcon />}
            onClick={handleSync}
            disabled={!isOnline || unsyncedCount === 0}
          >
            Sync Data
          </Button>
        </Badge>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ p: 2, textAlign: 'center', flex: 1 }}>
          <MapIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="subtitle1">Offline Maps</Typography>
          <Typography variant="caption" color="text.secondary">
            {offlineMode ? 'Available' : 'Enable offline mode'}
          </Typography>
        </Card>
        <Card sx={{ p: 2, textAlign: 'center', flex: 1 }}>
          <GPSIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="subtitle1">GPS Tracking</Typography>
          <Typography variant="caption" color="text.secondary">
            High accuracy mode
          </Typography>
        </Card>
        <Card sx={{ p: 2, textAlign: 'center', flex: 1 }}>
          <CameraIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="subtitle1">Photo Capture</Typography>
          <Typography variant="caption" color="text.secondary">
            Geotagged images
          </Typography>
        </Card>
        <Card sx={{ p: 2, textAlign: 'center', flex: 1 }}>
          <FormIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="subtitle1">Digital Forms</Typography>
          <Typography variant="caption" color="text.secondary">
            {fieldData.length} saved
          </Typography>
        </Card>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <List sx={{ maxHeight: 'calc(100% - 200px)', overflow: 'auto' }}>
          {fieldData.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem>
                <ListItemText
                  primary={item.formName}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {new Date(item.timestamp).toLocaleString()}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        Location: {item.latitude}, {item.longitude}
                      </Typography>
                    </>
                  }
                />
                <Chip 
                  label={item.synced ? 'Synced' : 'Pending'} 
                  size="small"
                  color={item.synced ? 'success' : 'warning'}
                  variant="outlined"
                />
              </ListItem>
              {index < fieldData.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default MobileFieldKit;