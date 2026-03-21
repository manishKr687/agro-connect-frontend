import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, TextField, Button, Box, MenuItem } from '@mui/material';
import axiosInstance from '../api/axiosConfig';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'FARMER' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: 'FARMER' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    axiosInstance.get('/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch users');
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
      await axiosInstance.post('/auth/register', form);
      fetchUsers();
      setForm({ name: '', phone: '', password: '', role: 'FARMER' });
    } catch (err) {
      setFormError('Failed to create user');
    }
    setFormLoading(false);
  };

  return (
    <Container>
      <Typography variant="h5" sx={{ mt: 4 }}>Users List</Typography>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h6">Create New User</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <TextField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <TextField
            label="Role"
            name="role"
            select
            value={form.role}
            onChange={handleChange}
            sx={{ mr: 2, mb: 2 }}
          >
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="FARMER">FARMER</MenuItem>
            <MenuItem value="MEDIATOR">MEDIATOR</MenuItem>
            <MenuItem value="RETAILER">RETAILER</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary" disabled={formLoading} sx={{ mb: 2 }}>
            {formLoading ? 'Creating...' : 'Create User'}
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
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <TextField value={editForm.name} name="name" onChange={handleEditChange} size="small" />
                    ) : user.name}
                  </TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <TextField value={editForm.phone} name="phone" onChange={handleEditChange} size="small" />
                    ) : user.phone}
                  </TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <TextField value={editForm.role} name="role" select onChange={handleEditChange} size="small">
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                        <MenuItem value="FARMER">FARMER</MenuItem>
                        <MenuItem value="MEDIATOR">MEDIATOR</MenuItem>
                        <MenuItem value="RETAILER">RETAILER</MenuItem>
                      </TextField>
                    ) : user.role}
                  </TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <>
                        <Button variant="contained" color="primary" size="small" onClick={() => handleUpdate(user.id)} sx={{ mr: 1 }}>Save</Button>
                        <Button variant="outlined" color="secondary" size="small" onClick={cancelEdit}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outlined" color="info" size="small" onClick={() => startEdit(user)} sx={{ mr: 1 }}>Edit</Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(user.id)}>Delete</Button>
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

function handleDelete(userId) {
  if (window.confirm('Are you sure you want to delete this user?')) {
    axiosInstance.delete(`/users/${userId}`)
      .then(() => {
        window.location.reload();
      })
      .catch(() => {
        alert('Failed to delete user');
      });
  }
}

// Inline edit helpers
function startEdit(user) {
  setEditingId(user.id);
  setEditForm({ name: user.name, phone: user.phone, role: user.role });
}

function handleEditChange(e) {
  setEditForm({ ...editForm, [e.target.name]: e.target.value });
}

function cancelEdit() {
  setEditingId(null);
  setEditForm({ name: '', phone: '', role: 'FARMER' });
}

async function handleUpdate(userId) {
  try {
    await axiosInstance.put(`/users/${userId}`, editForm);
    window.location.reload();
    cancelEdit();
  } catch (err) {
    alert('Failed to update user');
  }
}

export default Users;
