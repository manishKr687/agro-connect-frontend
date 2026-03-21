import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import DashboardShell from '../components/DashboardShell';
import SectionCard from '../components/SectionCard';
import { getSession } from '../utils/session';

function AgentDashboard() {
  const session = getSession();
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [rejectionReason, setRejectionReason] = useState({});

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get(`/api/agents/${session.userId}/tasks`);
      setTasks(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Unable to load assigned tasks.' });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const stats = useMemo(() => [
    { label: 'Assigned tasks', value: tasks.length, note: 'Current tasks allocated to you' },
    { label: 'In transit', value: tasks.filter((item) => item.status === 'IN_TRANSIT').length, note: 'Loads already on the move' },
    { label: 'Delivered', value: tasks.filter((item) => item.status === 'DELIVERED').length, note: 'Completed deliveries' },
  ], [tasks]);

  const performTaskAction = async (taskId, action, body = null, successMessage = 'Task updated.') => {
    try {
      await axiosInstance.post(`/api/agents/${session.userId}/tasks/${taskId}/${action}`, body);
      setStatus({ type: 'success', message: successMessage });
      fetchTasks();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to update task status.' });
    }
  };

  return (
    <DashboardShell
      role="AGENT"
      title="Agent Dashboard"
      subtitle={`Logged in as ${session.username}. Only assigned delivery tasks are visible here.`}
      stats={stats}
    >
      <SectionCard title="Assigned delivery tasks" subtitle="Review pickup and delivery details, then update status.">
        {status.message ? <Alert severity={status.type || 'info'} sx={{ mb: 2 }}>{status.message}</Alert> : null}

        <Box className="task-grid">
          {tasks.length === 0 ? (
            <Box className="empty-state">No tasks assigned right now.</Box>
          ) : (
            tasks.map((task) => (
              <Box key={task.id} className="task-card">
                <Box className="task-card__header">
                  <div>
                    <strong>Task #{task.id}</strong>
                    <div className="task-card__status">{task.status}</div>
                  </div>
                </Box>

                <div className="task-card__meta">
                  <div><strong>Harvest:</strong> {task.harvest?.cropName} | {task.harvest?.quantity} units | Price {task.harvest?.expectedPrice}</div>
                  <div><strong>Farmer:</strong> {task.harvest?.farmer?.username || '—'}</div>
                  <div><strong>Retailer:</strong> {task.demand?.retailer?.username || '—'}</div>
                  <div><strong>Demand:</strong> {task.demand?.cropName} | {task.demand?.quantity} units | Need by {task.demand?.requiredDate}</div>
                </div>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} className="task-card__actions">
                  {task.status === 'ASSIGNED' ? (
                    <>
                      <Button variant="contained" className="primary-button" onClick={() => performTaskAction(task.id, 'accept', null, 'Task accepted.')}>
                        Accept
                      </Button>
                      <TextField
                        label="Reject reason"
                        size="small"
                        value={rejectionReason[task.id] || ''}
                        onChange={(event) => setRejectionReason((current) => ({ ...current, [task.id]: event.target.value }))}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => performTaskAction(task.id, 'reject', { reason: rejectionReason[task.id] || 'Unavailable' }, 'Task rejected.')}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}

                  {task.status === 'ACCEPTED' ? (
                    <Button variant="contained" className="primary-button" onClick={() => performTaskAction(task.id, 'pickup', null, 'Task marked as picked up.')}>
                      Picked Up
                    </Button>
                  ) : null}

                  {task.status === 'PICKED_UP' ? (
                    <Button variant="contained" className="primary-button" onClick={() => performTaskAction(task.id, 'in-transit', null, 'Task marked as in transit.')}>
                      In Transit
                    </Button>
                  ) : null}

                  {task.status === 'IN_TRANSIT' ? (
                    <Button variant="contained" className="primary-button" onClick={() => performTaskAction(task.id, 'deliver', null, 'Task marked as delivered.')}>
                      Delivered
                    </Button>
                  ) : null}
                </Stack>
              </Box>
            ))
          )}
        </Box>
      </SectionCard>
    </DashboardShell>
  );
}

export default AgentDashboard;
