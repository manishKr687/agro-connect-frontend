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

const CHANNEL_META = {
  EMAIL: {
    label: 'Email reset link',
    helperText: 'Enter the email address saved on the account.',
  },
  SMS: {
    label: 'Mobile OTP',
    helperText: 'Enter the mobile number saved on the account.',
  },
};

function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedRole = searchParams.get('role');
  const roleMeta = ROLE_META[requestedRole];
  const [form, setForm] = React.useState({
    channel: 'EMAIL',
    identifier: '',
  });
  const [status, setStatus] = React.useState({ type: '', message: '' });
  const [preview, setPreview] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    setPreview(null);
    setSubmitting(true);

    try {
      const response = await axiosInstance.post('/api/auth/forgot-password', {
        channel: form.channel,
        identifier: form.identifier.trim(),
      });

      setPreview(response.data);
      setStatus({
        type: 'success',
        message: response.data.message || 'If that account exists, reset instructions were sent.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Unable to start password recovery right now.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const continueToReset = () => {
    const params = new URLSearchParams({
      channel: form.channel,
      identifier: form.identifier.trim(),
    });

    if (requestedRole) {
      params.set('role', requestedRole);
    }

    if (preview?.previewToken) {
      params.set('token', preview.previewToken);
    }

    if (preview?.previewOtp) {
      params.set('otp', preview.previewOtp);
    }

    navigate(`/reset-password?${params.toString()}`);
  };

  return (
    <AuthShell
      eyebrow="Password Recovery"
      title="Recover your account"
      description="Choose email reset link or mobile OTP. We will guide you to set a new password and revoke older sessions automatically."
      alternateLabel={roleMeta ? `Back to ${roleMeta.label.toLowerCase()} login` : 'Back to roles'}
      alternatePath={roleMeta ? roleHomePath(requestedRole, 'login') : '/'}
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        <Box>
          <Typography variant="h5" className="form-title">
            Forgot password
          </Typography>
          <Typography className="form-copy">
            {CHANNEL_META[form.channel].helperText}
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
          {Object.entries(CHANNEL_META).map(([value, meta]) => (
            <MenuItem key={value} value={value}>
              {meta.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label={form.channel === 'EMAIL' ? 'Email Address' : 'Mobile Number'}
          name="identifier"
          value={form.identifier}
          onChange={handleChange}
          fullWidth
          required
        />

        {preview?.maskedDestination ? (
          <Alert severity="info">
            Recovery target: {preview.maskedDestination}
            {preview.previewResetLink ? (
              <>
                <br />
                Dev preview link: {preview.previewResetLink}
              </>
            ) : null}
            {preview.previewOtp ? (
              <>
                <br />
                Dev preview OTP: {preview.previewOtp}
              </>
            ) : null}
          </Alert>
        ) : null}

        <Button type="submit" variant="contained" className="primary-button" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Recovery Instructions'}
        </Button>

        {preview ? (
          <Button type="button" variant="outlined" className="ghost-button" onClick={continueToReset}>
            Continue to Reset Password
          </Button>
        ) : null}
      </Stack>
    </AuthShell>
  );
}

export default ForgotPassword;
