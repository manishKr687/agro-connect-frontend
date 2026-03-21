import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const roles = [
  { title: 'Farmers', icon: '🌱' },
  { title: 'Mediators', icon: '🚚' },
  { title: 'Retailers', icon: '🛒' }
  // Admin intentionally omitted from dropdown
];

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleJoinClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleJoinClose = () => {
    setAnchorEl(null);
  };
  const handleJoinRole = (role) => {
    setAnchorEl(null);
    if (role === 'farmer') navigate('/register-farmer');
    else if (role === 'mediator') navigate('/register-mediator');
    else if (role === 'retailer') navigate('/register-retailer');
  };

  return (
    <AppBar position="static" color="inherit" elevation={1} sx={{ mb: 4 }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}> 
          <img src="/logo192.png" alt="AgroConnect Logo" style={{ height: 40, marginRight: 12 }} />
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            AgroConnect
          </Typography>
        </Box>
        <Button color="primary" onClick={() => navigate('/login')}>Login</Button>
        <Button color="success" variant="contained" sx={{ ml: 2 }} onClick={() => navigate('/dashboard')}>Get Started</Button>
        <Button color="secondary" variant="outlined" sx={{ ml: 2 }}
          aria-controls="join-menu"
          aria-haspopup="true"
          onClick={handleJoinClick}
        >
          Join
        </Button>
        {/* Admin Login button removed for localhost */}
        <Menu
          id="join-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleJoinClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MenuItem onClick={() => handleJoinRole('farmer')}>🌱 Join as Farmer</MenuItem>
          <MenuItem onClick={() => handleJoinRole('mediator')}>🚚 Join as Mediator</MenuItem>
          <MenuItem onClick={() => handleJoinRole('retailer')}>🛒 Join as Retailer</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
