import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Skeleton, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api/axiosConfig';
import DashboardShell from '../components/DashboardShell';
import SectionCard from '../components/SectionCard';
import { getSession } from '../utils/session';

function AgentDashboard() {
  const session = getSession();
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [rejectionReason, setRejectionReason] = useState({});
  const [tableLoading, setTableLoading] = useState(true);

  const fetchTasks = async () => {
    setTableLoading(true);
    try {
      const response = await axiosInstance.get(`/api/agents/${session.userId}/tasks`);
      setTasks(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: t('agent.error.load') });
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const stats = useMemo(() => [
    { label: t('agent.stats.assigned'),  value: tasks.filter((item) => item.status === 'ASSIGNED').length,   note: t('agent.stats.assignedNote') },
    { label: t('agent.stats.inTransit'), value: tasks.filter((item) => item.status === 'IN_TRANSIT').length, note: t('agent.stats.inTransitNote') },
    { label: t('agent.stats.delivered'), value: tasks.filter((item) => item.status === 'DELIVERED').length,  note: t('agent.stats.deliveredNote') },
  ], [tasks, t, i18n.language]);

  const performTaskAction = async (taskId, action, body = null, successKey = 'agent.success.accepted') => {
    try {
      await axiosInstance.post(`/api/agents/${session.userId}/tasks/${taskId}/${action}`, body);
      setStatus({ type: 'success', message: t(successKey) });
      fetchTasks();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || t('agent.error.update') });
    }
  };

  return (
    <DashboardShell
      role="AGENT"
      title={t('agent.dashboardTitle')}
      subtitle={t('agent.dashboardSubtitle', { name: session.name })}
      stats={stats}
    >
      <SectionCard title={t('agent.section.title')} subtitle={t('agent.section.subtitle')}>
        {status.message ? <Alert severity={status.type || 'info'} sx={{ mb: 2 }}>{status.message}</Alert> : null}

        <Stack spacing={2}>
          {tableLoading ? (
            [1, 2, 3].map((n) => (
              <Box key={n} className="task-card">
                <Skeleton width="40%" height={24} />
                <Skeleton width="70%" sx={{ mt: 1 }} />
                <Skeleton width="60%" />
              </Box>
            ))
          ) : tasks.length === 0 ? (
            <Box className="empty-state">{t('agent.empty')}</Box>
          ) : (
            tasks.map((task) => (
              <Box key={task.id} className="task-card">
                <Box className="task-card__header">
                  <div>
                    <strong>Task #{task.id}</strong>
                    <Chip
                      label={task.status.replace(/_/g, ' ')}
                      size="small"
                      className={`status-chip status-chip--${task.status.toLowerCase()}`}
                      sx={{ mt: 0.5 }}
                    />
                  </div>
                </Box>

                <div className="task-card__meta">
                  <div>
                    <strong>{t('agent.task.harvest')}:</strong>{' '}
                    {task.harvest?.cropName} · {task.harvest?.quantity} units · ₹{task.harvest?.expectedPrice}
                  </div>
                  <div>
                    <strong>{t('agent.task.farmer')}:</strong>{' '}
                    {task.harvest?.farmer?.name || '—'}
                  </div>
                  <div>
                    <strong>{t('agent.task.demand')}:</strong>{' '}
                    {task.demand?.cropName} · {task.demand?.quantity} units · {t('agent.task.needBy')} {task.demand?.requiredDate}
                  </div>
                  <div>
                    <strong>{t('agent.task.retailer')}:</strong>{' '}
                    {task.demand?.retailer?.name || '—'}
                  </div>
                </div>

                <Box className="task-card__actions">
                  {task.status === 'ASSIGNED' ? (
                    <Stack spacing={1.5}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                        <Button
                          variant="contained"
                          className="primary-button"
                          onClick={() => performTaskAction(task.id, 'accept', null, 'agent.success.accepted')}
                        >
                          {t('agent.action.accept')}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => performTaskAction(task.id, 'reject', { reason: rejectionReason[task.id] || 'Unavailable' }, 'agent.success.rejected')}
                        >
                          {t('agent.action.reject')}
                        </Button>
                      </Stack>
                      <TextField
                        label={t('agent.action.rejectReason')}
                        size="small"
                        fullWidth
                        value={rejectionReason[task.id] || ''}
                        onChange={(e) => setRejectionReason((curr) => ({ ...curr, [task.id]: e.target.value }))}
                        helperText="Optional — leave blank to use default reason."
                      />
                    </Stack>
                  ) : null}

                  {task.status === 'ACCEPTED' ? (
                    <Button
                      variant="contained"
                      className="primary-button"
                      onClick={() => performTaskAction(task.id, 'pickup', null, 'agent.success.pickedUp')}
                    >
                      {t('agent.action.pickedUp')}
                    </Button>
                  ) : null}

                  {task.status === 'PICKED_UP' ? (
                    <Button
                      variant="contained"
                      className="primary-button"
                      onClick={() => performTaskAction(task.id, 'in-transit', null, 'agent.success.inTransit')}
                    >
                      {t('agent.action.inTransit')}
                    </Button>
                  ) : null}

                  {task.status === 'IN_TRANSIT' ? (
                    <Button
                      variant="contained"
                      className="primary-button"
                      onClick={() => performTaskAction(task.id, 'deliver', null, 'agent.success.delivered')}
                    >
                      {t('agent.action.delivered')}
                    </Button>
                  ) : null}

                  {task.status === 'DELIVERED' ? (
                    <Chip label="✓ Delivered" size="small" className="status-chip status-chip--delivered" />
                  ) : null}

                  {task.status === 'REJECTED' ? (
                    <Chip label="✗ Rejected" size="small" className="status-chip status-chip--rejected" />
                  ) : null}
                </Box>
              </Box>
            ))
          )}
        </Stack>
      </SectionCard>
    </DashboardShell>
  );
}

export default AgentDashboard;
