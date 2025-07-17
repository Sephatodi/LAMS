/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    Download,
    ExpandLess,
    ExpandMore,
    MoreVert,
    Visibility,
    VisibilityOff,
    ZoomIn
} from '@mui/icons-material';
import {
    Box,
    Checkbox,
    Chip,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Slider,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FixedSizeList } from 'react-window';

const Legend = React.memo(({ 
  layers,
  onToggleVisibility,
  onOpacityChange,
  onZoomToLayer,
  onDownloadData,
  sx
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);

  const processedLayers = useMemo(() => {
    const filtered = layers.filter(layer =>
      layer.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return filtered.reduce((acc, layer) => {
      const category = layer.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = {
          name: category,
          layers: [],
          expanded: expandedCategories[category] ?? true
        };
      }
      acc[category].layers.push(layer);
      return acc;
    }, {});
  }, [layers, searchQuery, expandedCategories]);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleToggleCategory = useCallback((category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const handleContextMenu = useCallback((event, layer) => {
    event.preventDefault();
    setSelectedLayer(layer);
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const LayerRow = useCallback(({ index, style, data }) => {
    const layer = data[index];
    return (
      <ListItem 
        style={style} 
        key={layer.id}
        dense
        secondaryAction={
          <IconButton
            edge="end"
            onClick={(e) => handleContextMenu(e, layer)}
            aria-label="more-actions"
          >
            <MoreVert fontSize="small" />
          </IconButton>
        }
        sx={{ pr: 6 }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <Checkbox
            edge="start"
            checked={layer.visible}
            tabIndex={-1}
            onChange={() => onToggleVisibility(layer.id)}
            icon={<VisibilityOff />}
            checkedIcon={<Visibility />}
          />
        </ListItemIcon>
        <Chip 
          sx={{ 
            width: 24,
            height: 24,
            bgcolor: layer.color,
            mr: 2,
            border: `1px solid ${theme.palette.divider}`
          }} 
        />
        <Box sx={{ flexGrow: 1, mr: 2 }}>
          <Typography variant="body2">
            {t(`legend.${layer.label.toLowerCase().replace(/\s+/g, '_')}`)}
          </Typography>
          {layer.type === 'gradient' ? (
            <Slider
              value={layer.opacity}
              onChange={(e, value) => onOpacityChange(layer.id, value)}
              aria-labelledby="opacity-slider"
              sx={{ width: 100 }}
              min={0}
              max={1}
              step={0.1}
            />
          ) : (
            <Typography variant="caption" color="textSecondary">
              {layer.type}
            </Typography>
          )}
        </Box>
      </ListItem>
    );
  }, [onOpacityChange, onToggleVisibility, t, theme, handleContextMenu]);

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        width: 300,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 3,
        zIndex: theme.zIndex.tooltip,
        ...sx
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" gutterBottom>
          {t('legend.title')}
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder={t('legend.search')}
          value={searchQuery}
          onChange={handleSearch}
          inputProps={{ 'aria-label': 'Search layers' }}
        />
      </Box>

      <List sx={{ maxHeight: 400, overflow: 'auto' }} aria-label="legend-items">
        {Object.values(processedLayers).map(category => (
          <React.Fragment key={category.name}>
            <ListItemButton
              onClick={() => handleToggleCategory(category.name)}
              dense
            >
              <ListItemText primary={t(`categories.${category.name}`)} />
              {category.expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={category.expanded} timeout="auto" unmountOnExit>
              <FixedSizeList
                height={Math.min(category.layers.length * 60, 300)}
                width="100%"
                itemSize={60}
                itemCount={category.layers.length}
                itemData={category.layers}
              >
                {LayerRow}
              </FixedSizeList>
            </Collapse>
          </React.Fragment>
        ))}
      </List>

      <Menu
        open={!!contextMenu}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => {
          onZoomToLayer(selectedLayer?.id);
          handleCloseContextMenu();
        }}>
          <ListItemIcon>
            <ZoomIn fontSize="small" />
          </ListItemIcon>
          {t('legend.zoom_to_layer')}
        </MenuItem>
        <MenuItem onClick={() => {
          onDownloadData(selectedLayer?.id);
          handleCloseContextMenu();
        }}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          {t('legend.download_data')}
        </MenuItem>
      </Menu>
    </Box>
  );
});

// Add display name to fix the error
Legend.displayName = 'Legend';

Legend.propTypes = {
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['solid', 'gradient', 'pattern']),
      category: PropTypes.string,
      visible: PropTypes.bool,
      opacity: PropTypes.number,
    })
  ).isRequired,
  onToggleVisibility: PropTypes.func,
  onOpacityChange: PropTypes.func,
  onZoomToLayer: PropTypes.func,
  onDownloadData: PropTypes.func,
  sx: PropTypes.object,
};

Legend.defaultProps = {
  onToggleVisibility: () => {},
  onOpacityChange: () => {},
  onZoomToLayer: () => {},
  onDownloadData: () => {},
};

export default Legend;