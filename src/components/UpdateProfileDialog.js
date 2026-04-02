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
import { saveSession, getSession } from '../utils/session';

function UpdateProfileDialog({ open, onClose, onProfileUpdated }) {
  const session = getSession();
  const [form, setForm] = React.useState({ name: '', email: '' });
  const [submitting, setSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState({ type: '', message: '' });

  React.useEffect(() => {
    if (open) {
      axiosInstance.get('/api/users/me').then((response) => {
        setForm({
          name: response.data.name || '',
          email: response.data.email || '',
        });
      }).catch(() => {
        setStatus({ type: 'error', message: 'Unable to load profile data.' });
      });
    } else {
      setForm({ name: '', email: '' });
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
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axiosInstance.patch('/api/users/me/profile', {
        name: form.name.trim(),
        email: form.email.trim() || null,
      });
      saveSession({ ...session, name: response.data.name });
      onProfileUpdated(response.data.name);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Unable to update profile. Please try again.',
      });
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Stack component="form" onSubmit={handleSubmit} spacing={0}>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {status.message ? <Alert severity={status.type || 'info'}>{status.message}</Alert> : null}
            <TextField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              helperText="Optional. Used for password recovery."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}

export default UpdateProfileDialog;
