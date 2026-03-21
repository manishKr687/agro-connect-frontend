import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import DashboardShell from '../components/DashboardShell';
import MarketplaceTable from '../components/MarketplaceTable';
import SectionCard from '../components/SectionCard';
import { getSession } from '../utils/session';

const emptyDemand = {
  cropName: '',
  quantity: '',
  requiredDate: '',
  targetPrice: '',
};

function RetailerDashboard() {
  const session = getSession();
  const [demands, setDemands] = useState([]);
  const [form, setForm] = useState(emptyDemand);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const fetchDemands = async () => {
    try {
      const response = await axiosInstance.get(`/api/retailers/${session.userId}/demands`);
      setDemands(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Unable to load demand requests.' });
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const stats = useMemo(() => {
    const openDemands = demands.filter((item) => item.status === 'OPEN').length;
    const reservedDemands = demands.filter((item) => item.status === 'RESERVED').length;

    return [
      { label: 'Demand requests', value: demands.length, note: 'Requests created by your business' },
      { label: 'Open requests', value: openDemands, note: 'Available for matching' },
      { label: 'Reserved requests', value: reservedDemands, note: 'Already linked to a supply lot' },
    ];
  }, [demands]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyDemand);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = {
        cropName: form.cropName.trim(),
        quantity: Number(form.quantity),
        requiredDate: form.requiredDate,
        targetPrice: Number(form.targetPrice),
      };

      if (editingId) {
        await axiosInstance.put(`/api/retailers/${session.userId}/demands/${editingId}`, payload);
        setStatus({ type: 'success', message: 'Demand request updated.' });
      } else {
        await axiosInstance.post(`/api/retailers/${session.userId}/demands`, payload);
        setStatus({ type: 'success', message: 'Demand request created.' });
      }

      resetForm();
      fetchDemands();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to save demand request.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (demand) => {
    setEditingId(demand.id);
    setForm({
      cropName: demand.cropName || '',
      quantity: String(demand.quantity || ''),
      requiredDate: demand.requiredDate || '',
      targetPrice: String(demand.targetPrice || ''),
    });
    setStatus({ type: '', message: '' });
  };

  const handleDelete = async (demandId) => {
    try {
      await axiosInstance.delete(`/api/retailers/${session.userId}/demands/${demandId}`);
      if (editingId === demandId) {
        resetForm();
      }
      setStatus({ type: 'success', message: 'Demand request deleted.' });
      fetchDemands();
    } catch (error) {
      setStatus({ type: 'error', message: 'Unable to delete demand request.' });
    }
  };

  return (
    <DashboardShell
      role="RETAILER"
      title="Retailer Dashboard"
      subtitle={`Logged in as ${session.username}. Create demand requests and keep purchasing needs up to date.`}
      stats={stats}
    >
      <Box className="dashboard-grid">
        <SectionCard
          title={editingId ? 'Update demand' : 'Create demand'}
          subtitle="Capture product, quantity, required date, and target price."
        >
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            {status.message ? <Alert severity={status.type || 'info'}>{status.message}</Alert> : null}
            <TextField label="Product name" name="cropName" value={form.cropName} onChange={handleChange} required />
            <TextField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
            <TextField
              label="Required date"
              name="requiredDate"
              type="date"
              value={form.requiredDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Target price"
              name="targetPrice"
              type="number"
              value={form.targetPrice}
              onChange={handleChange}
              required
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button type="submit" variant="contained" className="primary-button" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Demand' : 'Create Demand'}
              </Button>
              <Button type="button" variant="outlined" className="ghost-button" onClick={resetForm}>
                Clear
              </Button>
            </Stack>
          </Stack>
        </SectionCard>

        <SectionCard title="My demand requests" subtitle="Only your own requests are listed.">
          <MarketplaceTable
            emptyMessage="No demand requests yet."
            rows={demands}
            columns={[
              { key: 'cropName', label: 'Product' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'targetPrice', label: 'Target price' },
              { key: 'requiredDate', label: 'Required date' },
              { key: 'status', label: 'Status', type: 'status' },
              {
                key: 'actions',
                label: 'Actions',
                type: 'actions',
                actions: (row) => [
                  { label: 'Edit', onClick: () => handleEdit(row) },
                  { label: 'Delete', color: 'error', onClick: () => handleDelete(row.id) },
                ],
              },
            ]}
          />
        </SectionCard>
      </Box>
    </DashboardShell>
  );
}

export default RetailerDashboard;
