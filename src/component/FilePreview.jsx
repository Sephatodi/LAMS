/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// components/land-application/ApplyForLand/FilePreview.js
import { AttachFile, Close } from '@mui/icons-material';
import {
    Avatar,
    IconButton,
    List, ListItem, ListItemText
} from '@mui/material';
import PropTypes from 'prop-types';
  
  const FilePreview = ({ file, files, onRemove }) => {
    // Handle both single file and array of files
    const fileList = file ? [file] : files || [];
  
    return (
      <List dense sx={{ mt: 2 }}>
        {fileList.map((f, index) => (
          <ListItem
            key={index}
            secondaryAction={
              onRemove && (
                <IconButton 
                  edge="end" 
                  onClick={() => onRemove(index)}
                >
                  <Close />
                </IconButton>
              )
            }
          >
            <Avatar sx={{ mr: 2 }}>
              <AttachFile />
            </Avatar>
            <ListItemText
              primary={f.name}
              secondary={`${(f.size / 1024).toFixed(1)} KB`}
            />
          </ListItem>
        ))}
      </List>
    );
  };
  
  FilePreview.propTypes = {
    file: PropTypes.object,
    files: PropTypes.array,
    onRemove: PropTypes.func
  };
  
  export default FilePreview;