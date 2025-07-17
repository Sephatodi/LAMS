/** @jsxRuntime classic */
/** @jsx React.createElement */

import { useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Navbar - visible on all screens */}
      <Navbar user={user} />
      
      {/* Sidebar - only visible when authenticated */}
      {user && <Sidebar user={user} />}
      
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          marginLeft: user ? '240px' : 0, // Adjust for sidebar
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Toolbar for spacing under fixed navbar */}
        <Toolbar />
        
        {/* Page content */}
        <Box sx={{ 
          maxWidth: 1200,
          mx: 'auto',
          py: 4,
          minHeight: 'calc(100vh - 128px)' // Adjust for header/footer
        }}>
          {children}
        </Box>
        
        {/* Footer - visible on all screens */}
        <Footer />
      </Box>
    </Box>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;