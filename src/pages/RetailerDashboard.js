import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, Stack, TextField,
  Tooltip, Typography,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MicIcon from '@mui/icons-material/Mic';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api/axiosConfig';
import DashboardShell from '../components/DashboardShell';
import MarketplaceTable from '../components/MarketplaceTable';
import SectionCard from '../components/SectionCard';
import { getSession } from '../utils/session';
import { useProduceDetection } from '../hooks/useProduceDetection';

const emptyDemand = { cropName: '', quantity: '', requiredDate: '', targetPrice: '' };

function RetailerDashboard() {
  const session = getSession();
  const { t }   = useTranslation();

  const [demands, setDemands]     = useState([]);
  const [form, setForm]           = useState(emptyDemand);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus]       = useState({ type: '', message: '' });
  const [loading, setLoading]     = useState(false);
  const [changeModal, setChangeModal] = useState({
    open: false, demandId: null, quantity: '', requiredDate: '', targetPrice: '', reason: '', saving: false,
  });

  const { aiLoading, aiError, recording, fileInputRef, preloadModel, triggerCamera, analyzeImage, startVoice, clearAiError } = useProduceDetection();

  const handleAiResult = ({ cropName, quantity, price }) => {
    setForm((current) => ({
      ...current,
      ...(cropName ? { cropName }                   : {}),
      ...(quantity ? { quantity: String(quantity) } : {}),
      ...(price    ? { targetPrice: String(price) } : {}),
    }));
  };

  const fetchDemands = async () => {
    try {
      const response = await axiosInstance.get(`/api/retailers/${session.userId}/demands`);
      setDemands(response.data);
    } catch {
      setStatus({ type: 'error', message: t('retailer.error.load') });
    }
  };

  useEffect(() => { fetchDemands(); preloadModel(); }, []);

  const stats = useMemo(() => [
    { label: t('retailer.stats.requests'), value: demands.length,                                              note: t('retailer.stats.requestsNote') },
    { label: t('retailer.stats.open'),     value: demands.filter((d) => d.status === 'OPEN').length,           note: t('retailer.stats.openNote') },
    { label: t('retailer.stats.reserved'), value: demands.filter((d) => d.status === 'RESERVED').length,       note: t('retailer.stats.reservedNote') },
  ], [demands, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => { setForm(emptyDemand); setEditingId(null); clearAiError(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setStatus({ type: 'success', message: t('retailer.success.updated') });
      } else {
        await axiosInstance.post(`/api/retailers/${session.userId}/demands`, payload);
        setStatus({ type: 'success', message: t('retailer.success.created') });
      }
      resetForm();
      fetchDemands();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || t('retailer.error.save') });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (demand) => {
    if (demand.status !== 'OPEN') {
      setStatus({ type: 'error', message: t('retailer.error.editRestricted') });
      return;
    }
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
      if (editingId === demandId) resetForm();
      setStatus({ type: 'success', message: t('retailer.success.deleted') });
      fetchDemands();
    } catch {
      setStatus({ type: 'error', message: t('retailer.error.delete') });
    }
  };

  const openChangeModal = (demand) => {
    setChangeModal({ open: true, demandId: demand.id, quantity: String(demand.quantity || ''), requiredDate: demand.requiredDate || '', targetPrice: String(demand.targetPrice || ''), reason: '', saving: false });
    setStatus({ type: '', message: '' });
  };

  const closeChangeModal = () => {
    setChangeModal({ open: false, demandId: null, quantity: '', requiredDate: '', targetPrice: '', reason: '', saving: false });
  };

  const handleChangeRequestSubmit = async (e) => {
    e.preventDefault();
    setChangeModal((cur) => ({ ...cur, saving: true }));
    try {
      await axiosInstance.post(
        `/api/retailers/${session.userId}/demands/${changeModal.demandId}/change-request`,
        { quantity: Number(changeModal.quantity), requiredDate: changeModal.requiredDate, targetPrice: Number(changeModal.targetPrice), reason: changeModal.reason.trim() },
      );
      closeChangeModal();
      setStatus({ type: 'success', message: t('retailer.success.changeRequest') });
      fetchDemands();
    } catch (error) {
      setChangeModal((cur) => ({ ...cur, saving: false }));
      setStatus({ type: 'error', message: error.response?.data?.message || t('retailer.error.changeRequest') });
    }
  };

  return (
    <DashboardShell
      role="RETAILER"
      title={t('retailer.dashboardTitle')}
      subtitle={t('retailer.dashboardSubtitle', { username: session.username })}
      stats={stats}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) analyzeImage(file, handleAiResult);
          e.target.value = '';
        }}
      />

      <Box className="dashboard-grid">
        <SectionCard
          title={editingId ? t('retailer.form.editTitle') : t('retailer.form.createTitle')}
          subtitle={t('retailer.form.subtitle')}
        >
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>

            {/* AI Input Toolbar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1, border: '1px dashed', borderColor: 'grey.300' }}>
              <Tooltip title={t('retailer.ai.cameraTooltip')}>
                <span>
                  <IconButton onClick={triggerCamera} disabled={aiLoading} size="small" color="primary">
                    {aiLoading ? <CircularProgress size={20} /> : <CameraAltIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={recording ? t('retailer.ai.micStopTooltip') : t('retailer.ai.micTooltip')}>
                <span>
                  <IconButton
                    onClick={() => startVoice(handleAiResult)}
                    disabled={aiLoading && !recording}
                    size="small"
                    color={recording ? 'error' : 'primary'}
                    sx={recording ? { animation: 'pulse 1s infinite' } : {}}
                  >
                    <MicIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Typography variant="caption" sx={{ color: recording ? 'error.main' : 'text.secondary' }}>
                {recording ? t('retailer.ai.recording') : aiLoading ? t('common.processing') : t('retailer.ai.hint')}
              </Typography>
            </Box>

            {aiError ? <Alert severity="warning" onClose={clearAiError}>{aiError}</Alert> : null}
            {status.message ? <Alert severity={status.type || 'info'}>{status.message}</Alert> : null}

            <TextField label={t('retailer.form.productName')} name="cropName"    value={form.cropName}    onChange={handleChange} required />
            <TextField label={t('retailer.form.quantity')}    name="quantity"    type="number" value={form.quantity} onChange={handleChange} required />
            <TextField
              label={t('retailer.form.requiredDate')}
              name="requiredDate"
              type="date"
              value={form.requiredDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField label={t('retailer.form.targetPrice')} name="targetPrice" type="number" value={form.targetPrice} onChange={handleChange} required />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button type="submit" variant="contained" className="primary-button" disabled={loading}>
                {loading ? t('common.saving') : editingId ? t('retailer.form.updateButton') : t('retailer.form.createButton')}
              </Button>
              <Button type="button" variant="outlined" className="ghost-button" onClick={resetForm}>
                {t('common.clear')}
              </Button>
            </Stack>
          </Stack>
        </SectionCard>

        <SectionCard title={t('retailer.table.title')} subtitle={t('retailer.table.subtitle')}>
          <MarketplaceTable
            emptyMessage={t('retailer.table.empty')}
            rows={demands}
            columns={[
              { key: 'cropName',    label: t('retailer.table.product') },
              { key: 'quantity',    label: t('retailer.table.quantity') },
              { key: 'targetPrice', label: t('retailer.table.targetPrice') },
              { key: 'requiredDate',label: t('retailer.table.requiredDate') },
              { key: 'status',      label: t('retailer.table.status'), type: 'status' },
              {
                key: 'actions',
                label: t('retailer.table.actions'),
                type: 'actions',
                actions: (row) => [
                  { label: t('common.edit'),   onClick: () => handleEdit(row),         disabled: row.status !== 'OPEN' },
                  { label: t('common.delete'), color: 'error', onClick: () => handleDelete(row.id), disabled: row.status !== 'OPEN' },
                  { label: t('retailer.table.requestChange'), onClick: () => openChangeModal(row), disabled: row.status !== 'RESERVED' },
                ],
              },
            ]}
          />
        </SectionCard>
      </Box>

      <Dialog open={changeModal.open} onClose={changeModal.saving ? undefined : closeChangeModal} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleChangeRequestSubmit}>
          <DialogTitle>{t('retailer.changeRequest.title')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField label={t('retailer.changeRequest.quantity')} name="quantity" type="number" value={changeModal.quantity} onChange={(e) => setChangeModal((cur) => ({ ...cur, quantity: e.target.value }))} required />
              <TextField
                label={t('retailer.changeRequest.requiredDate')}
                name="requiredDate"
                type="date"
                value={changeModal.requiredDate}
                onChange={(e) => setChangeModal((cur) => ({ ...cur, requiredDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField label={t('retailer.changeRequest.targetPrice')} name="targetPrice" type="number" value={changeModal.targetPrice} onChange={(e) => setChangeModal((cur) => ({ ...cur, targetPrice: e.target.value }))} required />
              <TextField
                label={t('retailer.changeRequest.reason')}
                name="reason"
                value={changeModal.reason}
                onChange={(e) => setChangeModal((cur) => ({ ...cur, reason: e.target.value }))}
                required multiline minRows={3}
                helperText={t('retailer.changeRequest.helperText')}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeChangeModal} disabled={changeModal.saving}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" disabled={changeModal.saving || !changeModal.reason.trim()}>
              {changeModal.saving ? t('retailer.changeRequest.sending') : t('retailer.changeRequest.sendButton')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </DashboardShell>
  );
}

export default RetailerDashboard;
