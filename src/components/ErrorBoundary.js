import React from 'react';
import { Box, Button, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', p: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Georgia, serif' }}>
              Something went wrong
            </Typography>
            <Typography sx={{ color: 'var(--muted)', mb: 3 }}>
              An unexpected error occurred. Please refresh the page.
            </Typography>
            <Button variant="contained" className="primary-button" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
