import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

const STATUS_CLASS = {
  AVAILABLE:           'status-chip--available',
  OPEN:                'status-chip--open',
  RESERVED:            'status-chip--reserved',
  ASSIGNED:            'status-chip--assigned',
  ACCEPTED:            'status-chip--accepted',
  PICKED_UP:           'status-chip--picked_up',
  IN_TRANSIT:          'status-chip--in_transit',
  DELIVERED:           'status-chip--delivered',
  FULFILLED:           'status-chip--fulfilled',
  SOLD:                'status-chip--sold',
  CANCELLED:           'status-chip--cancelled',
  REJECTED:            'status-chip--rejected',
  WITHDRAWAL_REQUESTED:'status-chip--withdrawal_requested',
  CHANGE_REQUESTED:    'status-chip--change_requested',
};

function renderValue(column, row) {
  if (column.render) return column.render(row);
  const value = row[column.key];
  if (value === null || value === undefined || value === '') return '—';
  return value;
}

function MarketplaceTable({ columns, rows, emptyMessage, loading = false }) {
  const [confirmDelete, setConfirmDelete] = React.useState({ open: false, action: null });

  const handleActionClick = (action, row) => {
    if (action.confirmDelete) {
      setConfirmDelete({ open: true, action: () => action.onClick(row) });
    } else {
      action.onClick(row);
    }
  };

  if (loading) {
    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  <Skeleton width="60%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3].map((n) => (
              <TableRow key={n}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!rows.length) {
    return (
      <Box className="empty-state">
        <Typography>{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id || row.key}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.type === 'status' ? (
                      <Chip
                        label={renderValue(column, row)}
                        size="small"
                        className={`status-chip ${STATUS_CLASS[renderValue(column, row)] || ''}`}
                      />
                    ) : column.type === 'actions' ? (
                      <Box className="table-actions">
                        {column.actions(row).map((action) => (
                          <Button
                            key={action.label}
                            variant={action.variant || 'text'}
                            color={action.color || 'primary'}
                            size="small"
                            onClick={() => handleActionClick(action, row)}
                            disabled={action.disabled}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </Box>
                    ) : (
                      renderValue(column, row)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, action: null })} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone. Are you sure?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, action: null })}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              confirmDelete.action?.();
              setConfirmDelete({ open: false, action: null });
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MarketplaceTable;
