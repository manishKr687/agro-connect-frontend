import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { clearSession, ROLE_META } from '../utils/session';

function DashboardShell({
  role,
  title,
  subtitle,
  stats = [],
  actions = [],
  children,
}) {
  const navigate        = useNavigate();
  const { t }          = useTranslation();
  const roleMeta        = ROLE_META[role];
  const [langAnchor, setLangAnchor] = React.useState(null);
  const [currentLang, setCurrentLang] = React.useState(i18n.language || 'en');

  const handleLogout = () => {
    clearSession();
    navigate(roleMeta?.loginPath || '/');
  };

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
    setLangAnchor(null);
  };

  return (
    <Box className="app-shell">
      <Container maxWidth="xl">
        <Box className="dashboard-header">
          <Box>
            <Chip label={roleMeta?.label || role} className="soft-chip" />
            <Typography variant="h3" className="dashboard-title">
              {title}
            </Typography>
            <Typography className="dashboard-copy">{subtitle}</Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button component={RouterLink} to="/" variant="outlined" className="ghost-button">
              {t('common.home')}
            </Button>
            <Button size="small" variant="outlined" onClick={(e) => setLangAnchor(e.currentTarget)}>
              {currentLang === 'hi' ? 'हिं' : 'EN'}
            </Button>
            <Menu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={() => setLangAnchor(null)}>
              <MenuItem onClick={() => switchLanguage('en')}>English</MenuItem>
              <MenuItem onClick={() => switchLanguage('hi')}>हिंदी</MenuItem>
            </Menu>
            <Button variant="contained" className="primary-button" onClick={handleLogout}>
              {t('common.logout')}
            </Button>
          </Stack>
        </Box>

        {actions.length > 0 && (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} className="dashboard-actions">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant || 'contained'}
                className={action.variant === 'outlined' ? 'ghost-button' : 'primary-button'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}

        {stats.length > 0 && (
          <Box className="stats-grid">
            {stats.map((stat) => (
              <Box key={stat.label} className="stat-card">
                <Typography className="stat-label">{stat.label}</Typography>
                <Typography className="stat-value">{stat.value}</Typography>
                <Typography className="stat-note">{stat.note}</Typography>
              </Box>
            ))}
          </Box>
        )}

        <Divider className="section-divider" />
        <Box className="dashboard-content">{children}</Box>
      </Container>
    </Box>
  );
}

export default DashboardShell;
