import React from 'react';
import { Container, Grid, Paper, Typography, Box, Button } from '@mui/material';
import DashboardNav from '../components/DashboardNav';

const metrics = [
  { label: 'Total Demand vs Supply', value: 'Live' },
  { label: 'Active Orders', value: 0 },
  { label: 'Delayed Pickups', value: 0 },
  { label: 'Aging Vegetables', value: 0 },
  { label: 'Revenue', value: '₹0' },
];

const decisions = [
  { label: 'Orders Awaiting Approval', action: 'Review', color: 'primary' },
  { label: 'Shortage Alerts', action: 'Resolve', color: 'warning' },
  { label: 'Demand Spikes', action: 'Analyze', color: 'secondary' },
];

function AdminControlTower() {
  return (
    <>
      <DashboardNav title="Admin Control Tower" />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Live Metrics */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Live Metrics</Typography>
              <Grid container spacing={2}>
                {metrics.map((m, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Box sx={{
                      p: 2,
                      bgcolor: '#e0ffe0',
                      borderRadius: 2,
                      textAlign: 'center',
                      boxShadow: 1,
                    }}>
                      <Typography variant="subtitle2">{m.label}</Typography>
                      <Typography variant="h5" color="primary.main">{m.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          {/* Decision Panels */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Decision Panels</Typography>
              {decisions.map((d, i) => (
                <Box key={i} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="subtitle2">{d.label}</Typography>
                  <Button variant="contained" color={d.color} sx={{ mt: 1 }} fullWidth>{d.action}</Button>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default AdminControlTower;
