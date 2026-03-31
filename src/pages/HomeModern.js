import React, { useRef, useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { Box, Button, Chip, Container, Typography } from '@mui/material';
import { ROLE_META, roleHomePath } from '../utils/session';

const roles = Object.entries(ROLE_META).map(([key, meta]) => ({
  role: key,
  label: meta.label,
  loginPath: meta.loginPath,
  registerPath: meta.registerPath,
}));

function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <Box ref={ref} className="nav-dropdown">
      <button className="nav-dropdown__trigger" onClick={() => setOpen((v) => !v)}>
        {label} <span className="nav-dropdown__arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <Box className="nav-dropdown__menu">
          {items.map((item) => (
            <RouterLink
              key={item.to}
              to={item.to}
              className="nav-dropdown__item"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </RouterLink>
          ))}
        </Box>
      )}
    </Box>
  );
}

function HomeModern({ session }) {
  if (session.userId && session.role) {
    return <Navigate to={roleHomePath(session.role, 'dashboard')} replace />;
  }

  const signInItems = roles.filter((r) => r.role !== 'ADMIN' && r.role !== 'AGENT').map((r) => ({ to: r.loginPath, label: r.label }));
  const registerItems = roles.filter((r) => r.role !== 'ADMIN' && r.role !== 'AGENT').map((r) => ({ to: r.registerPath, label: r.label }));

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
            <NavDropdown label="Sign In" items={signInItems} />
            <NavDropdown label="Register" items={registerItems} />
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
