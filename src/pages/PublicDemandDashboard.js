import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import { API_BASE } from '../api/axiosConfig';
import MarketplaceTable from '../components/MarketplaceTable';
import CROP_EMOJIS from '../utils/cropEmojis';

const COLUMNS = [
  {
    key: 'cropName',
    label: 'Crop',
    render: (row) => `${CROP_EMOJIS[row.cropName] ?? '🌱'} ${row.cropName}`,
  },
  { key: 'totalQuantity', label: 'Total Demand (kg)' },
];

function PublicDemandDashboard() {
  const [demands, setDemands] = useState([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const esRef = useRef(null);

  useEffect(() => {
    function connect() {
      const es = new EventSource(`${API_BASE}/api/public/demands/stream`);
      esRef.current = es;

      es.addEventListener('demands', (e) => {
        setDemands(JSON.parse(e.data));
        setLastUpdated(new Date());
        setLoading(false);
        setConnected(true);
      });

      es.onerror = () => {
        setConnected(false);
        es.close();
        // Reconnect after 5 s if the connection drops
        setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      esRef.current?.close();
    };
  }, []);

  return (
    <Box className="app-shell">
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Live Demand Market
            </Typography>
            <Chip label="Public" size="small" className="soft-chip" />
            <Chip
              label={connected ? 'Live' : 'Reconnecting…'}
              size="small"
              sx={{
                background: connected ? 'var(--primary)' : 'var(--accent)',
                color: '#fff',
                fontWeight: 600,
              }}
            />
          </Box>
          <Typography sx={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
            Open crop purchase demands from retailers — updates pushed instantly.
          </Typography>
          {lastUpdated && (
            <Typography sx={{ color: 'var(--muted)', fontSize: '0.8rem', mt: 0.5 }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: 'var(--primary)' }} />
          </Box>
        ) : (
          <Box className="section-card" sx={{ p: 0, overflow: 'hidden' }}>
            <MarketplaceTable
              columns={COLUMNS}
              rows={demands}
              emptyMessage="No open demands at the moment. Check back soon."
            />
          </Box>
        )}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography
            component={RouterLink}
            to="/"
            sx={{ color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'underline' }}
          >
            ← Back to home
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default PublicDemandDashboard;
