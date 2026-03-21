import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Chip, Container, Paper, Stack, Typography } from '@mui/material';

function AuthShell({
  eyebrow,
  title,
  description,
  alternateLabel,
  alternatePath,
  children,
}) {
  return (
    <Box className="app-shell auth-shell">
      <Container maxWidth="lg">
        <Box className="auth-grid">
          <Box className="auth-hero">
            <Chip label={eyebrow} className="soft-chip" />
            <Typography variant="h2" className="hero-title">
              {title}
            </Typography>
            <Typography className="hero-copy">
              {description}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button component={RouterLink} to="/" variant="outlined" className="ghost-button">
                Back to roles
              </Button>
              <Button component={RouterLink} to={alternatePath} variant="text" className="link-button">
                {alternateLabel}
              </Button>
            </Stack>
          </Box>

          <Paper elevation={0} className="auth-card">
            {children}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default AuthShell;
