import React from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { getSession, ROLE_META, roleHomePath } from '../utils/session';

const roleCards = Object.entries(ROLE_META).map(([key, value]) => ({
  role: key,
  title: value.label,
  loginPath: value.loginPath,
  registerPath: value.registerPath,
  blurb: {
    FARMER: 'List harvest supply, track pricing, and manage availability.',
    RETAILER: 'Post buying demand and monitor matching supply requests.',
    AGENT: 'See assigned pickups and update delivery progress clearly.',
    ADMIN: 'Supervise supply, demand, matching, and delivery assignments.',
  }[key],
}));

function HomeModern() {
  const session = getSession();

  if (session.token && session.role) {
    return <Navigate to={roleHomePath(session.role, 'dashboard')} replace />;
  }

  return (
    <Box className="app-shell">
      <Container maxWidth="xl">
        <Box className="landing-hero">
          <Chip label="Agro Connect Marketplace" className="soft-chip" />
          <Typography variant="h1" className="landing-title">
            Simple role-based workflows for agriculture trade.
          </Typography>
          <Typography className="landing-copy">
            Choose a role to access dedicated login, registration, and dashboard flows for harvests,
            demands, assignments, and delivery updates.
          </Typography>
        </Box>

        <Box className="role-grid">
          {roleCards.map((card) => (
            <Box key={card.role} className="role-card">
              <Typography variant="h4" className="role-card__title">
                {card.title}
              </Typography>
              <Typography className="role-card__copy">{card.blurb}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button component={RouterLink} to={card.loginPath} variant="contained" className="primary-button">
                  {card.title} Login
                </Button>
                <Button component={RouterLink} to={card.registerPath} variant="outlined" className="ghost-button">
                  {card.title} Register
                </Button>
              </Stack>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default HomeModern;
