import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Stack, TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api/axiosConfig';
import DashboardShell from '../components/DashboardShell';
import MarketplaceTable from '../components/MarketplaceTable';
import SectionCard from '../components/SectionCard';
import { getSession } from '../utils/session';
import HINDI_CROP_NAMES from '../utils/hindiCropNames';

const emptyHarvest = { cropName: '', quantity: '', harvestDate: '', expectedPrice: '' };

function FarmerDashboard() {
  const session = getSession();
  const { t, i18n } = useTranslation();

  const [harvests, setHarvests]       = useState([]);
  const [form, setForm]               = useState(emptyHarvest);
  const [editingId, setEditingId]     = useState(null);
  const [status, setStatus]           = useState({ type: '', message: '' });
  const [loading, setLoading]         = useState(false);
  const [withdrawalModal, setWithdrawalModal] = useState({ open: false, harvestId: null, reason: '', saving: false });
  const [cropNameHint, setCropNameHint] = useState('');
  const [cropDisplayName, setCropDisplayName] = useState('');

  const fetchHarvests = async () => {
    try {
      const response = await axiosInstance.get(`/api/farmers/${session.userId}/harvests`);
      setHarvests(response.data);
    } catch {
      setStatus({ type: 'error', message: t('farmer.error.load') });
    }
  };

  useEffect(() => { fetchHarvests(); }, []);

  useEffect(() => {
    if (!form.cropName) return;
    const isHindi = i18n.language.startsWith('hi');
    const hindiName = HINDI_CROP_NAMES[form.cropName];
    setCropDisplayName(isHindi && hindiName ? hindiName : form.cropName);
  }, [i18n.language]);

  const stats = useMemo(() => [
    { label: t('farmer.stats.entries'),   value: harvests.length,                                              note: t('farmer.stats.entriesNote') },
    { label: t('farmer.stats.available'), value: harvests.filter((h) => h.status === 'AVAILABLE').length,      note: t('farmer.stats.availableNote') },
    { label: t('farmer.stats.quantity'),  value: harvests.reduce((s, h) => s + Number(h.quantity || 0), 0).toFixed(1), note: t('farmer.stats.quantityNote') },
  ], [harvests, t, i18n.language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cropName') setCropDisplayName(value);
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => { setForm(emptyHarvest); setEditingId(null); setCropNameHint(''); setCropDisplayName(''); };

  const handleCropNameBlur = async (e) => {
    const raw = e.target.value.trim();
    if (!raw) return;
    try {
      const response = await axiosInstance.get(`/api/crops/normalize?name=${encodeURIComponent(raw)}`);
      const { normalized, corrected, valid } = response.data;
      const isHindi = i18n.language.startsWith('hi');
      const hindiName = HINDI_CROP_NAMES[normalized];
      if (!valid) {
        setCropNameHint(isHindi ? '⚠ फसल का नाम मान्य नहीं है। कृपया सही फसल का नाम दर्ज करें।' : '⚠ Crop name not recognized. Please enter a valid crop name.');
      } else {
        setForm((current) => ({ ...current, cropName: normalized }));
        setCropDisplayName(isHindi && hindiName ? hindiName : normalized);
        setCropNameHint(corrected ? (isHindi && hindiName ? `(${normalized})` : `Corrected to: ${normalized}`) : '');
      }
    } catch {
      setCropNameHint('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setStatus({ type: 'success', message: t('farmer.success.updated') });
      } else {
        await axiosInstance.post(`/api/farmers/${session.userId}/harvests`, payload);
        setStatus({ type: 'success', message: t('farmer.success.added') });
      }
      resetForm();
      fetchHarvests();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || t('farmer.error.save') });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (harvest) => {
    if (harvest.status !== 'AVAILABLE') {
      setStatus({ type: 'error', message: t('farmer.error.editRestricted') });
      return;
    }
    setEditingId(harvest.id);
    const englishName = harvest.cropName || '';
    const isHindi = i18n.language.startsWith('hi');
    const hindiName = HINDI_CROP_NAMES[englishName];
    setCropDisplayName(isHindi && hindiName ? hindiName : englishName);
    setCropNameHint('');
    setForm({
      cropName: englishName,
      quantity: String(harvest.quantity || ''),
      harvestDate: harvest.harvestDate || '',
      expectedPrice: String(harvest.expectedPrice || ''),
    });
    setStatus({ type: '', message: '' });
  };

  const handleDelete = async (harvestId) => {
    try {
      await axiosInstance.delete(`/api/farmers/${session.userId}/harvests/${harvestId}`);
      if (editingId === harvestId) resetForm();
      setStatus({ type: 'success', message: t('farmer.success.deleted') });
      fetchHarvests();
    } catch {
      setStatus({ type: 'error', message: t('farmer.error.delete') });
    }
  };

  const openWithdrawalModal  = (harvestId) => setWithdrawalModal({ open: true, harvestId, reason: '', saving: false });
  const closeWithdrawalModal = ()           => setWithdrawalModal({ open: false, harvestId: null, reason: '', saving: false });

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    setWithdrawalModal((cur) => ({ ...cur, saving: true }));
    try {
      await axiosInstance.post(
        `/api/farmers/${session.userId}/harvests/${withdrawalModal.harvestId}/withdrawal-request`,
        { reason: withdrawalModal.reason.trim() },
      );
      closeWithdrawalModal();
      setStatus({ type: 'success', message: t('farmer.success.withdrawal') });
      fetchHarvests();
    } catch (error) {
      setWithdrawalModal((cur) => ({ ...cur, saving: false }));
      setStatus({ type: 'error', message: error.response?.data?.message || t('farmer.error.withdrawal') });
    }
  };

  return (
    <DashboardShell
      role="FARMER"
      title={t('farmer.dashboardTitle')}
      subtitle={t('farmer.dashboardSubtitle', { username: session.username })}
      stats={stats}
    >
      <Box className="dashboard-grid">
        <SectionCard
          title={editingId ? t('farmer.form.editTitle') : t('farmer.form.addTitle')}
          subtitle={t('farmer.form.subtitle')}
        >
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>

            {status.message ? <Alert severity={status.type || 'info'}>{status.message}</Alert> : null}

            <TextField label={t('farmer.form.productName')} name="cropName" value={cropDisplayName} onChange={handleChange} onBlur={handleCropNameBlur} helperText={cropNameHint} required />
            <TextField label={t('farmer.form.quantity')}        name="quantity"      type="number" value={form.quantity}  onChange={handleChange} required />
            <TextField
              label={t('farmer.form.availabilityDate')}
              name="harvestDate"
              type="date"
              value={form.harvestDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField label={t('farmer.form.price')} name="expectedPrice" type="number" value={form.expectedPrice} onChange={handleChange} required />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button type="submit" variant="contained" className="primary-button" disabled={loading}>
                {loading ? t('common.saving') : editingId ? t('farmer.form.updateButton') : t('farmer.form.addButton')}
              </Button>
              <Button type="button" variant="outlined" className="ghost-button" onClick={resetForm}>
                {t('common.clear')}
              </Button>
            </Stack>
          </Stack>
        </SectionCard>

        <SectionCard title={t('farmer.table.title')} subtitle={t('farmer.table.subtitle')}>
          <MarketplaceTable
            emptyMessage={t('farmer.table.empty')}
            rows={harvests}
            columns={[
              { key: 'cropName',      label: t('farmer.table.product') },
              { key: 'quantity',      label: t('farmer.table.quantity') },
              { key: 'expectedPrice', label: t('farmer.table.price') },
              { key: 'harvestDate',   label: t('farmer.table.availability') },
              { key: 'status',        label: t('farmer.table.status'), type: 'status' },
              {
                key: 'actions',
                label: t('farmer.table.actions'),
                type: 'actions',
                actions: (row) => [
                  { label: t('common.edit'),   onClick: () => handleEdit(row),              disabled: row.status !== 'AVAILABLE' },
                  { label: t('common.delete'), color: 'error', onClick: () => handleDelete(row.id), disabled: row.status !== 'AVAILABLE' },
                  { label: t('farmer.table.requestWithdrawal'), onClick: () => openWithdrawalModal(row.id), disabled: row.status !== 'RESERVED' },
                ],
              },
            ]}
          />
        </SectionCard>
      </Box>

      <Dialog open={withdrawalModal.open} onClose={withdrawalModal.saving ? undefined : closeWithdrawalModal} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleWithdrawalSubmit}>
          <DialogTitle>{t('farmer.withdrawal.title')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                name="reason"
                label={t('farmer.withdrawal.reason')}
                value={withdrawalModal.reason}
                onChange={(e) => setWithdrawalModal((cur) => ({ ...cur, reason: e.target.value }))}
                required multiline minRows={3}
                helperText={t('farmer.withdrawal.helperText')}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeWithdrawalModal} disabled={withdrawalModal.saving}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" disabled={withdrawalModal.saving || !withdrawalModal.reason.trim()}>
              {withdrawalModal.saving ? t('farmer.withdrawal.sending') : t('farmer.withdrawal.sendButton')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </DashboardShell>
  );
}

export default FarmerDashboard;
