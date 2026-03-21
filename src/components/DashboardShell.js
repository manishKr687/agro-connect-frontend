import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { clearSession, ROLE_META } from '../utils/session';

function DashboardShell({
  role,
  title,
  subtitle,
  stats = [],
  actions = [],
  children,
}) {
  const navigate = useNavigate();
  const roleMeta = ROLE_META[role];

  const handleLogout = () => {
    clearSession();
    navigate(roleMeta?.loginPath || '/');
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
              Home
            </Button>
            <Button variant="contained" className="primary-button" onClick={handleLogout}>
              Logout
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
