import React, { useState, useEffect } from 'react';
const API_BASE = process.env.REACT_APP_API_BASE || '';
import { Container, Box, Typography, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';

function AgentManagement() {
  const [agents, setAgents] = useState([]);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/agents`);
      setAgents(res.data);
    } catch (err) {
      setError('Failed to fetch agents');
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');
    if (!name || !region) {
      setError('All fields are required');
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/agents`, { name, region });
      setStatusMsg('Agent added successfully');
      setName('');
      setRegion('');
      fetchAgents();
    } catch (err) {
      setError('Failed to add agent');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" align="center">Agent Management</Typography>
        <Paper sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleAddAgent}>
            <TextField label="Agent Name" value={name} onChange={e => setName(e.target.value)} margin="normal" required sx={{ mr: 2 }} />
            <TextField label="Region" value={region} onChange={e => setRegion(e.target.value)} margin="normal" required sx={{ mr: 2 }} />
            <Button type="submit" variant="contained" color="primary">Add Agent</Button>
          </form>
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          {statusMsg && <Typography color="primary" sx={{ mt: 2 }}>{statusMsg}</Typography>}
        </Paper>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Region</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map(agent => (
                <TableRow key={agent.id}>
                  <TableCell>{agent.id}</TableCell>
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>{agent.region}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Container>
  );
}

export default AgentManagement;
