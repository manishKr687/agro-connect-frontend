import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import DashboardShell from '../components/DashboardShell';
import MarketplaceTable from '../components/MarketplaceTable';
import SectionCard from '../components/SectionCard';
import { getSession } from '../utils/session';

const emptyHarvest = {
  cropName: '',
  quantity: '',
  harvestDate: '',
  expectedPrice: '',
};

function FarmerDashboard() {
  const session = getSession();
  const [harvests, setHarvests] = useState([]);
  const [form, setForm] = useState(emptyHarvest);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [withdrawalModal, setWithdrawalModal] = useState({ open: false, harvestId: null, reason: '', saving: false });

  const fetchHarvests = async () => {
    try {
      const response = await axiosInstance.get(`/api/farmers/${session.userId}/harvests`);
      setHarvests(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Unable to load harvest entries.' });
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, []);

  const stats = useMemo(() => {
    const totalQuantity = harvests.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const available = harvests.filter((item) => item.status === 'AVAILABLE').length;

    return [
      { label: 'Harvest entries', value: harvests.length, note: 'Current records in your supply list' },
      { label: 'Available lots', value: available, note: 'Ready for matching by admin' },
      { label: 'Total quantity', value: totalQuantity.toFixed(1), note: 'Combined quantity across all harvests' },
    ];
  }, [harvests]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyHarvest);
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
        harvestDate: form.harvestDate,
        expectedPrice: Number(form.expectedPrice),
      };

      if (editingId) {
        await axiosInstance.put(`/api/farmers/${session.userId}/harvests/${editingId}`, payload);
        setStatus({ type: 'success', message: 'Harvest entry updated.' });
      } else {
        await axiosInstance.post(`/api/farmers/${session.userId}/harvests`, payload);
        setStatus({ type: 'success', message: 'Harvest entry added.' });
      }

      resetForm();
      fetchHarvests();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to save harvest entry.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (harvest) => {
    if (harvest.status !== 'AVAILABLE') {
      setStatus({ type: 'error', message: 'Only available harvests can be edited.' });
      return;
    }

    setEditingId(harvest.id);
    setForm({
      cropName: harvest.cropName || '',
      quantity: String(harvest.quantity || ''),
      harvestDate: harvest.harvestDate || '',
      expectedPrice: String(harvest.expectedPrice || ''),
    });
    setStatus({ type: '', message: '' });
  };

  const handleDelete = async (harvestId) => {
    try {
      await axiosInstance.delete(`/api/farmers/${session.userId}/harvests/${harvestId}`);
      if (editingId === harvestId) {
        resetForm();
      }
      setStatus({ type: 'success', message: 'Harvest entry deleted.' });
      fetchHarvests();
    } catch (error) {
      setStatus({ type: 'error', message: 'Unable to delete harvest entry.' });
    }
  };

  const openWithdrawalModal = (harvestId) => {
    setWithdrawalModal({ open: true, harvestId, reason: '', saving: false });
    setStatus({ type: '', message: '' });
  };

  const closeWithdrawalModal = () => {
    setWithdrawalModal({ open: false, harvestId: null, reason: '', saving: false });
  };

  const handleWithdrawalChange = (event) => {
    const { value } = event.target;
    setWithdrawalModal((current) => ({ ...current, reason: value }));
  };

  const handleWithdrawalSubmit = async (event) => {
    event.preventDefault();
    setWithdrawalModal((current) => ({ ...current, saving: true }));

    try {
      await axiosInstance.post(
        `/api/farmers/${session.userId}/harvests/${withdrawalModal.harvestId}/withdrawal-request`,
        { reason: withdrawalModal.reason.trim() },
      );
      closeWithdrawalModal();
      setStatus({ type: 'success', message: 'Withdrawal request sent to admin for resolution.' });
      fetchHarvests();
    } catch (error) {
      setWithdrawalModal((current) => ({ ...current, saving: false }));
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to request withdrawal.' });
    }
  };

  return (
    <DashboardShell
      role="FARMER"
      title="Farmer Dashboard"
      subtitle={`Logged in as ${session.username}. Add harvest supply, maintain pricing, and keep availability accurate.`}
      stats={stats}
    >
      <Box className="dashboard-grid">
        <SectionCard
          title={editingId ? 'Update harvest' : 'Add harvest'}
          subtitle="Fill in crop, quantity, expected price, and availability date. Only available harvests can be changed directly."
        >
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            {status.message ? <Alert severity={status.type || 'info'}>{status.message}</Alert> : null}
            <TextField label="Product name" name="cropName" value={form.cropName} onChange={handleChange} required />
            <TextField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
            <TextField
              label="Availability date"
              name="harvestDate"
              type="date"
              value={form.harvestDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Price"
              name="expectedPrice"
              type="number"
              value={form.expectedPrice}
              onChange={handleChange}
              required
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button type="submit" variant="contained" className="primary-button" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Harvest' : 'Add Harvest'}
              </Button>
              <Button type="button" variant="outlined" className="ghost-button" onClick={resetForm}>
                Clear
              </Button>
            </Stack>
          </Stack>
        </SectionCard>

        <SectionCard title="My harvests" subtitle="Only your records are shown here.">
          <MarketplaceTable
            emptyMessage="No harvest entries yet."
            rows={harvests}
            columns={[
              { key: 'cropName', label: 'Product' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'expectedPrice', label: 'Price' },
              { key: 'harvestDate', label: 'Availability' },
              { key: 'status', label: 'Status', type: 'status' },
              {
                key: 'actions',
                label: 'Actions',
                type: 'actions',
                actions: (row) => [
                  { label: 'Edit', onClick: () => handleEdit(row), disabled: row.status !== 'AVAILABLE' },
                  { label: 'Delete', color: 'error', onClick: () => handleDelete(row.id), disabled: row.status !== 'AVAILABLE' },
                  { label: 'Request Withdrawal', onClick: () => openWithdrawalModal(row.id), disabled: row.status !== 'RESERVED' },
                ],
              },
            ]}
          />
        </SectionCard>
      </Box>

      <Dialog open={withdrawalModal.open} onClose={withdrawalModal.saving ? undefined : closeWithdrawalModal} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleWithdrawalSubmit}>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                name="reason"
                label="Reason"
                value={withdrawalModal.reason}
                onChange={handleWithdrawalChange}
                required
                multiline
                minRows={3}
                helperText="This will raise an admin exception for the reserved harvest."
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeWithdrawalModal} disabled={withdrawalModal.saving}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={withdrawalModal.saving || !withdrawalModal.reason.trim()}>
              {withdrawalModal.saving ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </DashboardShell>
  );
}

export default FarmerDashboard;
