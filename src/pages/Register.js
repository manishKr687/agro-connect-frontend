import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import AuthShell from '../components/AuthShell';
import { roleHomePath, saveSession } from '../utils/session';

const REGISTERABLE_ROLES = [
  { value: 'FARMER', label: 'Farmer' },
  { value: 'RETAILER', label: 'Retailer' },
];

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    email: '',
    role: 'FARMER',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((curr) => ({ ...curr, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!form.name.trim() || !form.phoneNumber.trim() || !form.password.trim()) {
      setStatus({ type: 'error', message: 'Name, phone number, and password are required.' });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/api/auth/register', {
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        role: form.role,
        email: form.email.trim() || null,
      });
      saveSession(response.data);
      navigate(roleHomePath(response.data.role, 'dashboard'));
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Unable to create account.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="AgroConnect"
      title="Create account"
      description="Register as a Farmer or Retailer. Agent and Admin accounts are created by administrators."
      alternateLabel="Already have an account? Sign in"
      alternatePath="/login"
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        <Box>
          <Typography variant="h5" className="form-title">
            Get started
          </Typography>
          <Typography className="form-copy">
            Choose your role and fill in your details below.
          </Typography>
        </Box>

        {status.message ? <Alert severity={status.type || 'info'}>{status.message}</Alert> : null}

        <TextField
          label="Role"
          name="role"
          value={form.role}
          onChange={handleChange}
          select
          fullWidth
          required
        >
          {REGISTERABLE_ROLES.map((r) => (
            <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          required
        />

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

        <Button type="submit" variant="contained" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </Stack>
    </AuthShell>
  );
}

export default Register;
