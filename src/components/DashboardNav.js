import axiosInstance from '../api/axiosConfig';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../utils/session';

const DashboardNav = ({ title }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    axiosInstance.post('/api/auth/logout')
      .finally(() => {
        clearSession();
        navigate('/login');
      });
  };
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{title}</Typography>
        <Button color="error" variant="contained" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardNav;
