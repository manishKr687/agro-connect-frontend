import React from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import { clearSession } from '../utils/session';

function ChangePasswordDialog({ open, onClose, onPasswordChanged }) {
  const [form, setForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState({ type: '', message: '' });

  React.useEffect(() => {
    if (!open) {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSubmitting(false);
      setStatus({ type: '', message: '' });
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await axiosInstance.post('/api/users/me/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      clearSession();
      onPasswordChanged();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Unable to change password. Please try again.',
      });
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Stack component="form" onSubmit={handleSubmit} spacing={0}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {status.message ? <Alert severity={status.type || 'info'}>{status.message}</Alert> : null}
            <TextField
              label="Current Password"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <TextField
              label="New Password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              helperText="Use at least 8 characters."
            />
            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}

export default ChangePasswordDialog;
