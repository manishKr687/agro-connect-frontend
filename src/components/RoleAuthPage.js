import React, { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import AuthShell from './AuthShell';
import { ROLE_META, saveSession } from '../utils/session';

const ROLE_DESCRIPTIONS = {
  FARMER: 'Manage harvest supply, update availability, and coordinate orders from a simple workspace.',
  RETAILER: 'Post crop demand, review your requests, and track supply assigned to your business.',
  AGENT: 'Handle assigned pickup and delivery tasks with focused status updates only.',
  ADMIN: 'Review marketplace activity, match harvests to demand, and assign delivery work to agents.',
};

function RoleAuthPage({ mode, role }) {
  const navigate = useNavigate();
  const roleMeta = ROLE_META[role];
  const isLogin = mode === 'login';
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const description = useMemo(() => {
    const lead = isLogin
      ? `Sign in to the ${roleMeta.label.toLowerCase()} workspace.`
      : `Create a ${roleMeta.label.toLowerCase()} account.`;

    return `${lead} ${ROLE_DESCRIPTIONS[role]}`;
  }, [isLogin, role, roleMeta.label]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!form.phoneNumber.trim() || !form.password.trim()) {
      setStatus({ type: 'error', message: 'Phone number and password are required.' });
      return;
    }

    if (!isLogin && !form.name.trim()) {
      setStatus({ type: 'error', message: 'Name is required.' });
      return;
    }

    if (!isLogin && form.password !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = isLogin
        ? {
            phoneNumber: form.phoneNumber.trim(),
            password: form.password,
          }
        : {
            name: form.name.trim(),
            phoneNumber: form.phoneNumber.trim(),
            password: form.password,
            role,
            email: form.email.trim() || null,
          };

      const response = await axiosInstance.post(
        isLogin ? '/api/auth/login' : '/api/auth/register',
        payload,
      );

      if (response.data.role !== role) {
        setStatus({
          type: 'error',
          message: `This page is only for ${roleMeta.label.toLowerCase()} accounts.`,
        });
        return;
      }

      saveSession(response.data);
      navigate(roleMeta.dashboardPath);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Unable to complete the request.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow={`${roleMeta.label} ${isLogin ? 'Login' : 'Registration'}`}
      title={`${roleMeta.label} ${isLogin ? 'Login' : 'Registration'}`}
      description={description}
      alternateLabel={isLogin ? 'Need an account? Register' : 'Already registered? Login'}
      alternatePath={isLogin ? roleMeta.registerPath : roleMeta.loginPath}
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        <Box>
          <Typography variant="h5" className="form-title">
            {isLogin ? 'Access your role workspace' : 'Create your role account'}
          </Typography>
          <Typography className="form-copy">
            Role is assigned automatically from this page.
          </Typography>
        </Box>

        {status.message ? <Alert severity={status.type || 'info'}>{status.message}</Alert> : null}

        <TextField
          label="Mobile Number"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          fullWidth
          required
          helperText="Use digits with optional + country code."
        />

        <TextField
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          fullWidth
          required
        />

        {isLogin ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
            <Button
              component={RouterLink}
              to={`/forgot-password?role=${role}`}
              variant="text"
              size="small"
              className="link-button"
            >
              Forgot password?
            </Button>
          </Box>
        ) : null}

        {!isLogin ? (
          <>
            <TextField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              helperText="Optional. Used for password recovery."
            />

            <TextField
              label="Assigned Role"
              value={roleMeta.label}
              select
              fullWidth
              disabled
            >
              <MenuItem value={roleMeta.label}>{roleMeta.label}</MenuItem>
            </TextField>
          </>
        ) : null}

        <Button type="submit" variant="contained" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Login' : 'Register')}
        </Button>
      </Stack>
    </AuthShell>
  );
}

export default RoleAuthPage;
