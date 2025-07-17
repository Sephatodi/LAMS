


const Sidebar = ({ user }) => {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Land Records', icon: <MapIcon />, path: '/land-records' },
    { text: 'User Management', icon: <PeopleIcon />, path: '/users', adminOnly: true },
    { text: 'Documents', icon: <DocumentsIcon />, path: '/documents' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help', icon: <HelpIcon />, path: '/help' }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar /> {/* Spacer for navbar */}
      <List>
        {menuItems
          .filter(item => !item.adminOnly || user?.role === 'admin')
          .map((item) => (
            <ListItem button key={item.text} component="a" href={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;