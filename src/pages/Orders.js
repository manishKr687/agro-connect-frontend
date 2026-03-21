import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
const API_BASE = process.env.REACT_APP_API_BASE || '';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ harvestId: '', demandId: '', status: 'CREATED' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    axiosInstance.get('/orders')
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch orders');
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
      // Use new backend order creation endpoint
      await axiosInstance.post('/orders/create', {
        harvestId: form.harvestId,
        demandId: form.demandId,
        adminId: localStorage.getItem('adminId'),
        normalizedPrice: form.normalizedPrice || 0,
        mediatorId: form.mediatorId || 0
      });
      fetchOrders();
      setForm({ harvestId: '', demandId: '', status: 'CREATED' });
    } catch (err) {
      setFormError('Failed to create order');
    }
    setFormLoading(false);
  };

  // Inline edit state
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ harvestId: '', demandId: '', status: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const startEdit = (order) => {
    setEditId(order.id);
    setEditForm({ harvestId: order.harvestId, demandId: order.demandId, status: order.status });
    setEditError('');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ harvestId: '', demandId: '', status: '' });
    setEditError('');
  };

  const handleEditSubmit = async (id) => {
    setEditLoading(true);
    setEditError('');
    try {
      await axiosInstance.put(`/orders/${id}`, editForm);
      fetchOrders();
      cancelEdit();
    } catch (err) {
      setEditError('Failed to update order');
    }
    setEditLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await axiosInstance.delete(`/orders/${id}`);
      fetchOrders();
    } catch (err) {
      setError('Failed to delete order');
    }
  };

  return (
    <Container>
      <Typography variant="h5" sx={{ mt: 4 }}>Orders List</Typography>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h6">Create New Order</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Harvest ID"
            name="harvestId"
            value={form.harvestId}
            onChange={handleChange}
            required
            sx={{ mr: 2, mb: 2 }}
          />
          <TextField
            label="Demand ID"
            name="demandId"
            value={form.demandId}
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
            <MenuItem value="CREATED">CREATED</MenuItem>
            <MenuItem value="ASSIGNED">ASSIGNED</MenuItem>
            <MenuItem value="DELIVERED">DELIVERED</MenuItem>
            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary" disabled={formLoading} sx={{ mb: 2 }}>
            {formLoading ? 'Creating...' : 'Create Order'}
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
                <TableCell>Harvest</TableCell>
                <TableCell>Demand</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    {editId === order.id ? (
                      <TextField
                        name="harvestId"
                        value={editForm.harvestId}
                        onChange={handleEditChange}
                        size="small"
                        sx={{ width: 100 }}
                      />
                    ) : order.harvestId}
                  </TableCell>
                  <TableCell>
                    {editId === order.id ? (
                      <TextField
                        name="demandId"
                        value={editForm.demandId}
                        onChange={handleEditChange}
                        size="small"
                        sx={{ width: 100 }}
                      />
                    ) : order.demandId}
                  </TableCell>
                  <TableCell>
                    {editId === order.id ? (
                      <TextField
                        name="status"
                        select
                        value={editForm.status}
                        onChange={handleEditChange}
                        size="small"
                        sx={{ width: 120 }}
                      >
                        <MenuItem value="CREATED">CREATED</MenuItem>
                        <MenuItem value="ASSIGNED">ASSIGNED</MenuItem>
                        <MenuItem value="DELIVERED">DELIVERED</MenuItem>
                        <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                      </TextField>
                    ) : order.status}
                  </TableCell>
                  <TableCell>
                    {editId === order.id ? (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleEditSubmit(order.id)}
                          disabled={editLoading}
                          sx={{ mr: 1 }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                        {editError && <Typography color="error" sx={{ ml: 2 }}>{editError}</Typography>}
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => startEdit(order)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(order.id)}
                        >
                          Delete
                        </Button>
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

export default Orders;
