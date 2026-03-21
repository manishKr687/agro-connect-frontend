import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import axiosInstance from '../api/axiosConfig';

function Demands() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ crop: '', quantity: '', status: 'OPEN' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ crop: '', quantity: '', status: 'OPEN' });

  useEffect(() => {
    fetchDemands();
  }, []);

  const fetchDemands = () => {
    setLoading(true);
    axiosInstance.get('/demands')
      .then(res => {
        setDemands(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch demands');
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await axiosInstance.post('/demands', form);
      fetchDemands();
      setForm({ crop: '', quantity: '', status: 'OPEN' });
    } catch (err) {
      setFormError('Failed to create demand');
    }
    setFormLoading(false);
  };

  return (
    <Container>
      <Typography variant="h5" sx={{ mt: 4 }}>Demands List</Typography>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h6">Add New Demand</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Crop"
            name="crop"
            value={form.crop}
            onChange={handleChange}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <TextField
            label="Quantity"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <TextField
            label="Status"
            name="status"
            select
            value={form.status}
            onChange={handleChange}
            sx={{ mr: 2, mb: 2 }}
          >
            <MenuItem value="OPEN">OPEN</MenuItem>
            <MenuItem value="FULFILLED">FULFILLED</MenuItem>
            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary" disabled={formLoading} sx={{ mb: 2 }}>
            {formLoading ? 'Adding...' : 'Add Demand'}
          </Button>
          {formError && <Typography color="error" sx={{ ml: 2 }}>{formError}</Typography>}
        </form>
      </Box>
      {loading ? <CircularProgress sx={{ mt: 2 }} /> : error ? <Typography color="error">{error}</Typography> : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Crop</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {demands.map(demand => (
                <TableRow key={demand.id}>
                  <TableCell>{demand.id}</TableCell>
                  <TableCell>
                    {editingId === demand.id ? (
                      <TextField value={editForm.crop} name="crop" onChange={handleEditChange} size="small" />
                    ) : demand.crop}
                  </TableCell>
                  <TableCell>
                    {editingId === demand.id ? (
                      <TextField value={editForm.quantity} name="quantity" onChange={handleEditChange} size="small" />
                    ) : demand.quantity}
                  </TableCell>
                  <TableCell>
                    {editingId === demand.id ? (
                      <TextField value={editForm.status} name="status" select onChange={handleEditChange} size="small">
                        <MenuItem value="OPEN">OPEN</MenuItem>
                        <MenuItem value="FULFILLED">FULFILLED</MenuItem>
                        <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                      </TextField>
                    ) : demand.status}
                  </TableCell>
                  <TableCell>
                    {editingId === demand.id ? (
                      <>
                        <Button variant="contained" color="primary" size="small" onClick={() => handleUpdate(demand.id)} sx={{ mr: 1 }}>Save</Button>
                        <Button variant="outlined" color="secondary" size="small" onClick={cancelEdit}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outlined" color="info" size="small" onClick={() => startEdit(demand)} sx={{ mr: 1 }}>Edit</Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(demand.id)}>Delete</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

function handleDelete(demandId) {
  if (window.confirm('Are you sure you want to delete this demand?')) {
    axiosInstance.delete(`/demands/${demandId}`)
      .then(() => {
        window.location.reload();
      })
      .catch(() => {
        alert('Failed to delete demand');
      });
  }
}

// Inline edit helpers
function startEdit(demand) {
  setEditingId(demand.id);
  setEditForm({ crop: demand.crop, quantity: demand.quantity, status: demand.status });
}

function handleEditChange(e) {
  setEditForm({ ...editForm, [e.target.name]: e.target.value });
}

function cancelEdit() {
  setEditingId(null);
  setEditForm({ crop: '', quantity: '', status: 'OPEN' });
}

async function handleUpdate(demandId) {
  try {
    await axiosInstance.put(`/demands/${demandId}`, editForm);
    window.location.reload();
    cancelEdit();
  } catch (err) {
    alert('Failed to update demand');
  }
}

export default Demands;
