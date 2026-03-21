import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

function SectionCard({ title, subtitle, children, aside }) {
  return (
    <Paper elevation={0} className="section-card">
      <Box className="section-card__header">
        <Box>
          <Typography variant="h5" className="section-card__title">
            {title}
          </Typography>
          {subtitle ? (
            <Typography className="section-card__subtitle">{subtitle}</Typography>
          ) : null}
        </Box>
        {aside || null}
      </Box>
      <Box>{children}</Box>
    </Paper>
  );
}

export default SectionCard;
