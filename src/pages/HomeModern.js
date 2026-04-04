import { Link as RouterLink, Navigate } from 'react-router-dom';
import { Box, Button, Chip, Container, Typography } from '@mui/material';
import { getSession, roleHomePath } from '../utils/session';

function HomeModern() {
  const session = getSession();
  if (session.userId && session.role) {
    return <Navigate to={roleHomePath(session.role, 'dashboard')} replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* ── Navbar ── */}
      <Box className="home-nav">
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography className="home-nav__brand">Agro Connect</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button component={RouterLink} to="/market" variant="text" className="nav-text-btn">
              Live Market
            </Button>
            <Button component={RouterLink} to="/login" variant="outlined" className="ghost-button">
              Sign In
            </Button>
            <Button component={RouterLink} to="/register" variant="contained" className="primary-button">
              Register
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Hero ── */}
      <Container maxWidth="xl" sx={{ pt: 10, pb: 8 }}>
        <Box className="landing-hero">
          <Chip label="Agro Connect Marketplace" className="soft-chip" />
          <Typography variant="h1" className="landing-title">
            Simple role-based workflows for agriculture trade.
          </Typography>
          <Typography className="landing-copy">
            A supply chain platform connecting farmers, retailers, and delivery agents —
            from harvest to doorstep.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/market" variant="contained" className="primary-button">
              View Live Demand Market
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default HomeModern;
