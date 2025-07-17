// /src/components/disputes/MediationTool.jsx
import {
  AttachFile as AttachIcon,
  Mic as AudioIcon,
  Close as CloseIcon,
  ScreenShare as ScreenShareIcon,
  Send as SendIcon,
  Videocam as VideoIcon
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import React, { useRef, useState } from 'react';
import { useAddMediationMessageMutation, useGetDisputeQuery } from '../../api/landBoardApi';

const MediationTool = ({ disputeId, onClose }) => {
  const { data: dispute, isLoading } = useGetDisputeQuery(disputeId);
  const [addMessage] = useAddMediationMessageMutation();
  const [message, setMessage] = useState('');
  const [isVideoActive, setIsVideoActive] = useState(false);
  const videoRef = useRef(null);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      await addMessage({
        disputeId,
        content: message,
        sender: 'mediator', // In real app, would use actual user
        timestamp: new Date().toISOString()
      }).unwrap();
      
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const startVideoConference = () => {
    setIsVideoActive(true);
    // In a real app, would initialize WebRTC connection here
  };

  const stopVideoConference = () => {
    setIsVideoActive(false);
    // In a real app, would close WebRTC connection here
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Mediation Session: {dispute?.parcels?.join(' ↔ ') || 'Dispute'}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'auto', mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        {isLoading ? (
          <Typography>Loading dispute details...</Typography>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Chip label={`Status: ${dispute.status}`} sx={{ mr: 1 }} />
              <Chip label={`Type: ${dispute.type}`} color="primary" />
            </Box>
            
            {isVideoActive && (
              <Box sx={{ 
                width: '100%', 
                height: 300, 
                bgcolor: 'black', 
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 1
              }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
                <Typography variant="caption" color="white">
                  Video conference in progress
                </Typography>
              </Box>
            )}
            
            <Typography variant="subtitle1" gutterBottom>
              Mediation History
            </Typography>
            
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {dispute.mediationHistory?.map((msg, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <Avatar sx={{ mr: 2 }}>
                      {msg.sender.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={msg.sender}
                      secondary={msg.content}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                  </ListItem>
                  {index < dispute.mediationHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Button 
          variant="outlined" 
          startIcon={<VideoIcon />}
          onClick={isVideoActive ? stopVideoConference : startVideoConference}
          color={isVideoActive ? 'error' : 'primary'}
        >
          {isVideoActive ? 'End Video' : 'Start Video'}
        </Button>
        <Button variant="outlined" startIcon={<AudioIcon />}>
          Audio Call
        </Button>
        <Button variant="outlined" startIcon={<ScreenShareIcon />}>
          Share Screen
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your mediation message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <IconButton>
          <AttachIcon />
        </IconButton>
        <Button 
          variant="contained" 
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default MediationTool;