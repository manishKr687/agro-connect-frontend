import React, { useState } from 'react';
const API_BASE = process.env.REACT_APP_API_BASE || '';
import { Container, Box, Typography, TextField, Button } from '@mui/material';

function RegisterRetailer() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');
    if (!phone || !password || !name) {
      setError('All fields are required');
      return;
    }
    const payload = { name, phone, passwordHash: password, businessName };
    try {
      await axios.post(`${API_BASE}/api/register/retailer`, payload);
      setSubmitted(true);
      setStatusMsg('Registration submitted! Your application is pending approval. You will be notified once reviewed.');
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" align="center">Register as Retailer</Typography>
        {submitted ? (
          <Box sx={{ mt: 4 }}>
            <Typography color="primary" align="center">{statusMsg}</Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth margin="normal" required autoComplete="off" />
            <TextField label="Phone" value={phone} onChange={e => setPhone(e.target.value)} fullWidth margin="normal" required autoComplete="off" />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" required autoComplete="new-password" />
            <TextField label="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} fullWidth margin="normal" autoComplete="off" />
            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Register</Button>
          </form>
        )}
      </Box>
    </Container>
  );
}

export default RegisterRetailer;
