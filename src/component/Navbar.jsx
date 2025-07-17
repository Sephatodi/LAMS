
const Navbar = ({ user }) => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          LAMS - Land Administration Management System
        </Typography>
        {user && (
          <Typography variant="subtitle1">
            {user.name} ({user.role})
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;