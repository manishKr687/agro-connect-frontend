import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const navigate    = useNavigate();
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl]     = React.useState(null);
  const [langAnchor, setLangAnchor] = React.useState(null);

  const handleJoinClick  = (e) => setAnchorEl(e.currentTarget);
  const handleJoinClose  = ()  => setAnchorEl(null);
  const handleLangClick  = (e) => setLangAnchor(e.currentTarget);
  const handleLangClose  = ()  => setLangAnchor(null);

  const handleJoinRole = (role) => {
    setAnchorEl(null);
    if (role === 'farmer')   navigate('/register-farmer');
    else if (role === 'mediator') navigate('/register-mediator');
    else if (role === 'retailer') navigate('/register-retailer');
  };

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLangAnchor(null);
  };

  return (
    <AppBar position="static" color="inherit" elevation={1} sx={{ mb: 4 }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo192.png" alt="AgroConnect Logo" style={{ height: 40, marginRight: 12 }} />
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {t('common.appName')}
          </Typography>
        </Box>

        <Button color="primary" onClick={() => navigate('/login')}>{t('common.login')}</Button>
        <Button color="success" variant="contained" sx={{ ml: 2 }} onClick={() => navigate('/dashboard')}>{t('common.getStarted')}</Button>
        <Button color="secondary" variant="outlined" sx={{ ml: 2 }} onClick={handleJoinClick}>{t('common.join')}</Button>

        {/* Language switcher */}
        <Button sx={{ ml: 2, minWidth: 40 }} onClick={handleLangClick}>
          {i18n.language === 'hi' ? 'हिं' : 'EN'}
        </Button>
        <Menu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={handleLangClose}>
          <MenuItem onClick={() => switchLanguage('en')}>English</MenuItem>
          <MenuItem onClick={() => switchLanguage('hi')}>हिंदी</MenuItem>
        </Menu>

        <Menu
          id="join-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleJoinClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MenuItem onClick={() => handleJoinRole('farmer')}>🌱 {t('common.joinFarmer')}</MenuItem>
          <MenuItem onClick={() => handleJoinRole('mediator')}>🚚 {t('common.joinMediator')}</MenuItem>
          <MenuItem onClick={() => handleJoinRole('retailer')}>🛒 {t('common.joinRetailer')}</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
