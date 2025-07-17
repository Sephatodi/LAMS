import { Assessment, Lock, People, Security, SettingsBackupRestore, Timeline, Toolbar } from '@mui/icons-material';
import { Divider, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

const AdminNav = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': { 
          width: 240,
          bgcolor: '#f5f5f5'
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {[
          { text: 'User Management', icon: <People />, path: '/admin/users' },
          { text: 'Role Management', icon: <Lock />, path: '/admin/roles' },
          { text: 'System Monitoring', icon: <Timeline />, path: '/admin/monitor' },
          { text: 'Data Security', icon: <Security />, path: '/admin/security' },
          { text: 'Backup & Restore', icon: <SettingsBackupRestore />, path: '/admin/backup' },
          { text: 'Audit Logs', icon: <Assessment />, path: '/admin/audit' },
        ].map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            sx={{
              '&.Mui-selected': { bgcolor: '#bbdefb' },
              '&:hover': { bgcolor: '#e3f2fd' }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default AdminNav;