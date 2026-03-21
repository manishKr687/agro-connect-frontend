import React from 'react';
import {
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

function renderValue(column, row) {
  if (column.render) {
    return column.render(row);
  }

  const value = row[column.key];

  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return value;
}

function MarketplaceTable({ columns, rows, emptyMessage }) {
  if (!rows.length) {
    return (
      <Box className="empty-state">
        <Typography>{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
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
                    <Chip label={renderValue(column, row)} size="small" className="status-chip" />
                  ) : column.type === 'actions' ? (
                    <Box className="table-actions">
                      {column.actions(row).map((action) => (
                        <Button
                          key={action.label}
                          variant={action.variant || 'text'}
                          color={action.color || 'primary'}
                          size="small"
                          onClick={action.onClick}
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
  );
}

export default MarketplaceTable;
