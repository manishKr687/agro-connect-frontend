import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import AuthShell from '../components/AuthShell';
import { roleHomePath, ROLE_META } from '../utils/session';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedRole = searchParams.get('role');
  const roleMeta = ROLE_META[requestedRole];
  const [form, setForm] = React.useState({
    channel: searchParams.get('channel') || 'EMAIL',
    identifier: searchParams.get('identifier') || '',
    token: searchParams.get('token') || '',
    otp: searchParams.get('otp') || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [status, setStatus] = React.useState({ type: '', message: '' });
  const [submitting, setSubmitting] = React.useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/api/auth/reset-password', {
        channel: form.channel,
        identifier: form.identifier.trim(),
        token: form.channel === 'EMAIL' ? form.token.trim() : null,
        otp: form.channel === 'SMS' ? form.otp.trim() : null,
        newPassword: form.newPassword,
      });

      navigate(roleMeta ? roleHomePath(requestedRole, 'login') : '/login', {
        replace: true,
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Unable to reset password. Check the token or OTP and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Set New Password"
      title="Choose a new password"
      description="Enter the reset link token or mobile OTP you received, then set a fresh password. Existing sessions will be revoked after success."
      alternateLabel={roleMeta ? `Back to ${roleMeta.label.toLowerCase()} login` : 'Back to roles'}
      alternatePath={roleMeta ? roleHomePath(requestedRole, 'login') : '/'}
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        <Box>
          <Typography variant="h5" className="form-title">
            Reset password
          </Typography>
          <Typography className="form-copy">
            Use the same recovery method that you selected on the previous step.
          </Typography>
        </Box>

        {status.message ? <Alert severity={status.type || 'info'}>{status.message}</Alert> : null}

        <TextField
          select
          label="Recovery Method"
          name="channel"
          value={form.channel}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="EMAIL">Email reset link</MenuItem>
          <MenuItem value="SMS">Mobile OTP</MenuItem>
        </TextField>

        <TextField
          label={form.channel === 'EMAIL' ? 'Email Address' : 'Mobile Number'}
          name="identifier"
          value={form.identifier}
          onChange={handleChange}
          fullWidth
          required
        />

        {form.channel === 'EMAIL' ? (
          <TextField
            label="Reset Token"
            name="token"
            value={form.token}
            onChange={handleChange}
            fullWidth
            required
          />
        ) : (
          <TextField
            label="OTP"
            name="otp"
            value={form.otp}
            onChange={handleChange}
            fullWidth
            required
          />
        )}

        <TextField
          label="New Password"
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          fullWidth
          required
        />

        <Button type="submit" variant="contained" className="primary-button" disabled={submitting}>
          {submitting ? 'Resetting...' : 'Reset Password'}
        </Button>
      </Stack>
    </AuthShell>
  );
}

export default ResetPassword;
