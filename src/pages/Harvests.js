import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import axiosInstance from '../api/axiosConfig';

function Harvests() {
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ crop: '', quantity: '', status: 'AVAILABLE' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ crop: '', quantity: '', status: 'AVAILABLE' });

  useEffect(() => {
    fetchHarvests();
  }, []);

  const fetchHarvests = () => {
    setLoading(true);
    axiosInstance.get('/harvests')
      .then(res => {
        setHarvests(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch harvests');
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
      await axiosInstance.post('/harvests', form);
      fetchHarvests();
      setForm({ crop: '', quantity: '', status: 'AVAILABLE' });
    } catch (err) {
      setFormError('Failed to create harvest');
    }
    setFormLoading(false);
  };

  return (
    <Container>
      <Typography variant="h5" sx={{ mt: 4 }}>Harvests List</Typography>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h6">Add New Harvest</Typography>
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
            <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
            <MenuItem value="SOLD">SOLD</MenuItem>
            <MenuItem value="EXPIRED">EXPIRED</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary" disabled={formLoading} sx={{ mb: 2 }}>
            {formLoading ? 'Adding...' : 'Add Harvest'}
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
              {harvests.map(harvest => (
                <TableRow key={harvest.id}>
                  <TableCell>{harvest.id}</TableCell>
                  <TableCell>
                    {editingId === harvest.id ? (
                      <TextField value={editForm.crop} name="crop" onChange={handleEditChange} size="small" />
                    ) : harvest.crop}
                  </TableCell>
                  <TableCell>
                    {editingId === harvest.id ? (
                      <TextField value={editForm.quantity} name="quantity" onChange={handleEditChange} size="small" />
                    ) : harvest.quantity}
                  </TableCell>
                  <TableCell>
                    {editingId === harvest.id ? (
                      <TextField value={editForm.status} name="status" select onChange={handleEditChange} size="small">
                        <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                        <MenuItem value="SOLD">SOLD</MenuItem>
                        <MenuItem value="EXPIRED">EXPIRED</MenuItem>
                      </TextField>
                    ) : harvest.status}
                  </TableCell>
                  <TableCell>
                    {editingId === harvest.id ? (
                      <>
                        <Button variant="contained" color="primary" size="small" onClick={() => handleUpdate(harvest.id)} sx={{ mr: 1 }}>Save</Button>
                        <Button variant="outlined" color="secondary" size="small" onClick={cancelEdit}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outlined" color="info" size="small" onClick={() => startEdit(harvest)} sx={{ mr: 1 }}>Edit</Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(harvest.id)}>Delete</Button>
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

function handleDelete(harvestId) {
  if (window.confirm('Are you sure you want to delete this harvest?')) {
    axiosInstance.delete(`/harvests/${harvestId}`)
      .then(() => {
        window.location.reload();
      })
      .catch(() => {
        alert('Failed to delete harvest');
      });
  }
}

// Inline edit helpers
function startEdit(harvest) {
  setEditingId(harvest.id);
  setEditForm({ crop: harvest.crop, quantity: harvest.quantity, status: harvest.status });
}

function handleEditChange(e) {
  setEditForm({ ...editForm, [e.target.name]: e.target.value });
}

function cancelEdit() {
  setEditingId(null);
  setEditForm({ crop: '', quantity: '', status: 'AVAILABLE' });
}

async function handleUpdate(harvestId) {
  try {
    await axiosInstance.put(`/harvests/${harvestId}`, editForm);
    window.location.reload();
    cancelEdit();
  } catch (err) {
    alert('Failed to update harvest');
  }
}

export default Harvests;
