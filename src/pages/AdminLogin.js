import { useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import AuthShell from '../components/AuthShell';
import { saveSession } from '../utils/session';

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phoneNumber: '', password: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((curr) => ({ ...curr, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!form.phoneNumber.trim() || !form.password.trim()) {
      setStatus({ type: 'error', message: 'Phone number and password are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
      });

      if (response.data.role !== 'ADMIN') {
        setStatus({ type: 'error', message: 'This page is only for admin accounts.' });
        return;
      }

      flushSync(() => saveSession(response.data));
      navigate('/admin/dashboard');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Invalid phone number or password.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Admin"
      title="Admin Login"
      description="Restricted access. Review marketplace activity, match harvests to demand, and assign delivery work to agents."
      alternateLabel="Back to home"
      alternatePath="/"
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        <Box>
          <Typography variant="h5" className="form-title">
            Admin workspace
          </Typography>
          <Typography className="form-copy">
            Enter your admin credentials to continue.
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

        <Button type="submit" variant="contained" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </Stack>
    </AuthShell>
  );
}

export default AdminLogin;
