import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import DashboardShell from '../components/DashboardShell';
import MarketplaceTable from '../components/MarketplaceTable';
import SectionCard from '../components/SectionCard';
import { getSession } from '../utils/session';

const emptyAssignment = { harvestId: '', demandId: '' };

const emptyModal = {
  open: false,
  title: '',
  endpoint: '',
  method: 'put',
  successMessage: '',
  fields: [],
  values: {},
};

const emptyTaskDetails = { open: false, loading: false, task: null };

function TwoColGrid({ children }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: '20px' }}>
      {children}
    </Box>
  );
}

function WorkflowPanel({ active, value, children }) {
  if (active !== value) return null;
  return <Stack spacing={2.5}>{children}</Stack>;
}

function AdminDashboard() {
  const session = getSession();
  const [harvests, setHarvests] = useState([]);
  const [demands, setDemands] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [matchSuggestions, setMatchSuggestions] = useState([]);
  const [taskExceptions, setTaskExceptions] = useState([]);
  const [assignment, setAssignment] = useState(emptyAssignment);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(emptyModal);
  const [modalLoading, setModalLoading] = useState(false);
  const [taskDetails, setTaskDetails] = useState(emptyTaskDetails);
  const [activeTab, setActiveTab] = useState('operations');

  const fetchAdminData = async () => {
    try {
      const [harvestRes, demandRes, taskRes, userRes, matchRes, exceptionRes] = await Promise.all([
        axiosInstance.get(`/api/admins/${session.userId}/harvests`),
        axiosInstance.get(`/api/admins/${session.userId}/demands`),
        axiosInstance.get(`/api/admins/${session.userId}/tasks`),
        axiosInstance.get(`/api/admins/${session.userId}/users`),
        axiosInstance.get(`/api/admins/${session.userId}/match-suggestions`),
        axiosInstance.get(`/api/admins/${session.userId}/exceptions/tasks`),
      ]);
      setHarvests(harvestRes.data);
      setDemands(demandRes.data);
      setTasks(taskRes.data);
      setUsers(userRes.data);
      setMatchSuggestions(matchRes.data);
      setTaskExceptions(exceptionRes.data);
    } catch {
      setStatus({ type: 'error', message: 'Unable to load admin data.' });
    }
  };

  useEffect(() => { fetchAdminData(); }, []);

  const agentUsers = useMemo(() => users.filter((u) => u.role === 'AGENT'), [users]);
  const availableHarvests = useMemo(() => harvests.filter((h) => h.status === 'AVAILABLE'), [harvests]);
  const supplyQueueHarvests = useMemo(() => harvests.filter((h) => !['SOLD', 'WITHDRAWN'].includes(h.status)), [harvests]);
  const openDemands = useMemo(() => demands.filter((d) => d.status === 'OPEN'), [demands]);
  const demandQueueDemands = useMemo(() => demands.filter((d) => d.status !== 'FULFILLED'), [demands]);
  const activeTasks = useMemo(() => tasks.filter((t) => !['DELIVERED', 'REJECTED', 'CANCELLED'].includes(t.status)), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'DELIVERED'), [tasks]);

  const agentTaskSummary = useMemo(() => agentUsers.map((agent) => {
    const assigned = tasks.filter((t) => t.assignedAgent?.id === agent.id);
    return {
      id: agent.id,
      name: agent.name,
      totalAssigned: assigned.length,
      activeTasks: assigned.filter((t) => !['DELIVERED', 'REJECTED', 'CANCELLED'].includes(t.status)).length,
      completedTasks: assigned.filter((t) => t.status === 'DELIVERED').length,
    };
  }), [agentUsers, tasks]);

  const recommendedAgent = useMemo(() => [...agentTaskSummary].sort((a, b) => {
    if (a.activeTasks !== b.activeTasks) return a.activeTasks - b.activeTasks;
    if (a.totalAssigned !== b.totalAssigned) return a.totalAssigned - b.totalAssigned;
    return a.id - b.id;
  })[0] || null, [agentTaskSummary]);

  const canAssignTask = availableHarvests.length > 0 && openDemands.length > 0 && Boolean(recommendedAgent);

  const stats = useMemo(() => [
    { label: 'Open supply lots',      value: availableHarvests.length, note: 'Harvests ready for matching' },
    { label: 'Open demand requests',  value: openDemands.length,       note: 'Retailer requests waiting' },
    { label: 'Active deliveries',     value: activeTasks.length,       note: 'Assignments in progress' },
    { label: 'Completed deliveries',  value: completedTasks.length,    note: 'Assignments closed' },
  ], [availableHarvests.length, openDemands.length, activeTasks.length, completedTasks.length]);

  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignment((curr) => ({ ...curr, [name]: value }));
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await axiosInstance.post(`/api/admins/${session.userId}/assignments/approve`, {
        harvestId: Number(assignment.harvestId),
        demandId: Number(assignment.demandId),
      });
      setAssignment(emptyAssignment);
      setStatus({ type: 'success', message: 'Assignment approved and sent to the recommended agent.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to assign task.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSuggestedMatch = async (suggestion) => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await axiosInstance.post(`/api/admins/${session.userId}/assignments/approve`, {
        harvestId: Number(suggestion.harvestId),
        demandId: Number(suggestion.demandId),
      });
      setStatus({ type: 'success', message: 'Suggested match approved and assigned automatically.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to approve match.' });
    } finally {
      setLoading(false);
    }
  };

  const openModal = ({ title, endpoint, method = 'put', successMessage, fields, values }) => {
    setModal({ open: true, title, endpoint, method, successMessage, fields, values });
  };

  const closeModal = () => { setModal(emptyModal); setModalLoading(false); };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModal((curr) => ({ ...curr, values: { ...curr.values, [name]: value } }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const payload = modal.fields.reduce((result, field) => {
        const raw = modal.values[field.name];
        result[field.name] = field.parse ? field.parse(raw) : raw;
        return result;
      }, {});
      if (modal.method === 'post') {
        await axiosInstance.post(modal.endpoint, payload);
      } else {
        await axiosInstance.put(modal.endpoint, payload);
      }
      closeModal();
      setStatus({ type: 'success', message: modal.successMessage });
      fetchAdminData();
    } catch (error) {
      setModalLoading(false);
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to save.' });
    }
  };

  const openUserCreateModal = () => openModal({
    title: 'Create User',
    endpoint: `/api/admins/${session.userId}/users`,
    method: 'post',
    successMessage: 'User created.',
    values: { name: '', role: '', password: '', email: '', phoneNumber: '' },
    fields: [
      { name: 'name', label: 'Full Name', required: true },
      { name: 'phoneNumber', label: 'Mobile Number', required: true, helperText: 'Use digits with optional + country code.' },
      { name: 'email', label: 'Email' },
      { name: 'role', label: 'Role', required: true, select: true, options: ['ADMIN', 'FARMER', 'RETAILER', 'AGENT'] },
      { name: 'password', label: 'Password', type: 'password', required: true },
    ],
  });

  const openUserEditModal = (user) => openModal({
    title: `Update User #${user.id}`,
    endpoint: `/api/admins/${session.userId}/users/${user.id}`,
    successMessage: 'User updated.',
    values: { name: user.name || '', role: user.role || '', password: '', email: user.email || '', phoneNumber: user.phoneNumber || '' },
    fields: [
      { name: 'name', label: 'Full Name', required: true },
      { name: 'phoneNumber', label: 'Mobile Number', required: true, helperText: 'Use digits with optional + country code.' },
      { name: 'email', label: 'Email' },
      { name: 'role', label: 'Role', required: true, select: true, options: ['ADMIN', 'FARMER', 'RETAILER', 'AGENT'] },
      { name: 'password', label: 'New Password', type: 'password', helperText: 'Leave blank to keep the current password.' },
    ],
  });

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axiosInstance.delete(`/api/admins/${session.userId}/users/${userId}`);
      setStatus({ type: 'success', message: 'User deleted.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to delete user.' });
    }
  };

  const openTaskReassignModal = (task) => openModal({
    title: `Reassign Task #${task.id}`,
    endpoint: `/api/admins/${session.userId}/tasks/${task.id}/reassign`,
    method: 'post',
    successMessage: 'Task reassigned.',
    values: { agentId: String(task.assignedAgent?.id || '') },
    fields: [{
      name: 'agentId',
      label: 'Agent',
      required: true,
      select: true,
      options: agentUsers.map((a) => ({ value: String(a.id), label: `#${a.id} ${a.name}` })),
      parse: (v) => Number(v),
    }],
  });

  const openTaskCancelModal = (task) => openModal({
    title: `Cancel Task #${task.id}`,
    endpoint: `/api/admins/${session.userId}/tasks/${task.id}/cancel`,
    method: 'post',
    successMessage: 'Task cancelled.',
    values: { reason: '' },
    fields: [{ name: 'reason', label: 'Cancellation Reason', required: true }],
  });

  const handleRetryTask = async (taskId) => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await axiosInstance.post(`/api/admins/${session.userId}/tasks/${taskId}/retry`);
      setStatus({ type: 'success', message: 'Task retried and reassigned automatically.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to retry task.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDemandChange = async (demandId) => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await axiosInstance.post(`/api/admins/${session.userId}/demands/${demandId}/approve-change`);
      setStatus({ type: 'success', message: 'Demand change approved.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to approve demand change.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDemandChange = async (demandId) => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await axiosInstance.post(`/api/admins/${session.userId}/demands/${demandId}/reject-change`);
      setStatus({ type: 'success', message: 'Demand change rejected.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to reject demand change.' });
    } finally {
      setLoading(false);
    }
  };

  const openTaskDetails = async (taskId) => {
    setTaskDetails({ open: true, loading: true, task: null });
    try {
      const response = await axiosInstance.get(`/api/admins/${session.userId}/tasks/${taskId}`);
      setTaskDetails({ open: true, loading: false, task: response.data });
    } catch (error) {
      setTaskDetails(emptyTaskDetails);
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to load task details.' });
    }
  };

  const formatDateTime = (value) => value ? new Date(value).toLocaleString() : '—';

  return (
    <DashboardShell
      role="ADMIN"
      title="Admin Dashboard"
      subtitle={`Logged in as ${session.name}. Match harvests to demand, monitor deliveries, and manage platform access.`}
      stats={stats}
    >
      {status.message ? <Alert severity={status.type || 'info'} sx={{ mb: 2 }}>{status.message}</Alert> : null}

      <Box className="workflow-tabs">
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab value="operations" label="Operations" />
          <Tab value="monitoring" label="Monitoring" />
          <Tab value="administration" label="Administration" />
        </Tabs>
      </Box>

      {/* ── Operations ── */}
      <WorkflowPanel active={activeTab} value="operations">
        <TwoColGrid>
          <SectionCard
            title="Suggested Matches"
            subtitle="Review scored harvest-demand pairs and approve to auto-assign the least-loaded agent."
            aside={<Typography className="workflow-hint">Primary Flow</Typography>}
          >
            <Box className="empty-state" sx={{ mb: 2 }}>
              <Typography>
                {recommendedAgent
                  ? `Next auto-assign → Agent #${recommendedAgent.id} ${recommendedAgent.name} (${recommendedAgent.activeTasks} active)`
                  : 'No agent available for automatic assignment.'}
              </Typography>
            </Box>
            <MarketplaceTable
              emptyMessage="No suggested matches available."
              rows={matchSuggestions}
              columns={[
                { key: 'harvestCropName', label: 'Harvest' },
                { key: 'harvestId',       label: 'H-ID' },
                { key: 'demandCropName',  label: 'Demand' },
                { key: 'demandId',        label: 'D-ID' },
                { key: 'demandQuantity',  label: 'Qty' },
                { key: 'score',           label: 'Score' },
                { key: 'reason',          label: 'Reason' },
                {
                  key: 'actions',
                  label: 'Actions',
                  type: 'actions',
                  actions: (row) => [
                    { label: 'Approve', onClick: () => handleApproveSuggestedMatch(row), disabled: loading || !recommendedAgent },
                  ],
                },
              ]}
            />
          </SectionCard>

          <SectionCard
            title="Manual Match Override"
            subtitle="Choose harvest and demand manually when the suggested list is not suitable."
            aside={<Typography className="workflow-hint">Fallback</Typography>}
          >
            <Stack spacing={2} component="form" onSubmit={handleAssign}>
              <TextField
                select
                label="Harvest"
                name="harvestId"
                value={assignment.harvestId}
                onChange={handleAssignmentChange}
                helperText={availableHarvests.length === 0 ? 'No available harvests.' : ''}
                required
              >
                {availableHarvests.length === 0
                  ? <MenuItem value="" disabled>No available harvests</MenuItem>
                  : availableHarvests.map((h) => (
                    <MenuItem key={h.id} value={h.id}>
                      #{h.id} {h.cropName} · {h.farmer?.name} · Qty {h.quantity}
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                select
                label="Demand"
                name="demandId"
                value={assignment.demandId}
                onChange={handleAssignmentChange}
                helperText={openDemands.length === 0 ? 'No open demands.' : ''}
                required
              >
                {openDemands.length === 0
                  ? <MenuItem value="" disabled>No open demands</MenuItem>
                  : openDemands.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      #{d.id} {d.cropName} · {d.retailer?.name} · Qty {d.quantity}
                    </MenuItem>
                  ))}
              </TextField>

              <Button type="submit" variant="outlined" className="ghost-button" disabled={loading || !canAssignTask}>
                {loading ? 'Approving...' : 'Approve Manual Match'}
              </Button>
            </Stack>
          </SectionCard>
        </TwoColGrid>

        <SectionCard
          title="Task Operations"
          subtitle="Reassign active tasks when delivery operations need intervention."
          aside={<Typography className="workflow-hint">After Approval</Typography>}
        >
          <MarketplaceTable
            emptyMessage="No active tasks."
            rows={activeTasks}
            columns={[
              { key: 'id',      label: 'Task' },
              { key: 'harvest', label: 'Harvest',  render: (row) => `${row.harvest?.cropName || '-'} (#${row.harvest?.id || '-'})` },
              { key: 'demand',  label: 'Demand',   render: (row) => `${row.demand?.cropName || '-'} (#${row.demand?.id || '-'})` },
              { key: 'agent',   label: 'Agent',    render: (row) => row.assignedAgent?.name || '-' },
              { key: 'status',  label: 'Status',   type: 'status' },
              {
                key: 'actions',
                label: 'Actions',
                type: 'actions',
                actions: (row) => [{ label: 'Reassign', onClick: () => openTaskReassignModal(row) }],
              },
            ]}
          />
        </SectionCard>

        <TwoColGrid>
          <SectionCard title="Supply Queue" subtitle="Harvests still moving through the marketplace.">
            <MarketplaceTable
              emptyMessage="No supply queue items."
              rows={supplyQueueHarvests}
              columns={[
                { key: 'id',            label: 'ID' },
                { key: 'cropName',      label: 'Product' },
                { key: 'farmer',        label: 'Farmer',  render: (row) => row.farmer?.name || '-' },
                { key: 'quantity',      label: 'Qty' },
                { key: 'expectedPrice', label: 'Price' },
                { key: 'status',        label: 'Status',  type: 'status' },
              ]}
            />
          </SectionCard>

          <SectionCard title="Demand Queue" subtitle="Retailer demand requests and their fulfillment state.">
            <MarketplaceTable
              emptyMessage="No demand queue items."
              rows={demandQueueDemands}
              columns={[
                { key: 'id',          label: 'ID' },
                { key: 'cropName',    label: 'Product' },
                { key: 'retailer',    label: 'Retailer', render: (row) => row.retailer?.name || '-' },
                { key: 'quantity',    label: 'Qty' },
                { key: 'targetPrice', label: 'Target' },
                { key: 'status',      label: 'Status',   type: 'status' },
              ]}
            />
          </SectionCard>
        </TwoColGrid>
      </WorkflowPanel>

      {/* ── Monitoring ── */}
      <WorkflowPanel active={activeTab} value="monitoring">
        <SectionCard title="Agent Workload" subtitle="Total assigned, active, and completed tasks per agent.">
          <MarketplaceTable
            emptyMessage="No agents found."
            rows={agentTaskSummary}
            columns={[
              { key: 'id',             label: 'ID' },
              { key: 'name',           label: 'Agent' },
              { key: 'totalAssigned',  label: 'Assigned' },
              { key: 'activeTasks',    label: 'Active' },
              { key: 'completedTasks', label: 'Completed' },
            ]}
          />
        </SectionCard>

        <TwoColGrid>
          <SectionCard title="Active Deliveries" subtitle="Assignments still in motion.">
            <MarketplaceTable
              emptyMessage="No active deliveries."
              rows={activeTasks}
              columns={[
                { key: 'id',      label: 'Task' },
                { key: 'harvest', label: 'Harvest', render: (row) => row.harvest?.cropName || '-' },
                { key: 'demand',  label: 'Demand',  render: (row) => row.demand?.cropName || '-' },
                { key: 'agent',   label: 'Agent',   render: (row) => row.assignedAgent?.name || '-' },
                { key: 'status',  label: 'Status',  type: 'status' },
              ]}
            />
          </SectionCard>

          <SectionCard title="Completed Deliveries" subtitle="Assignments finished successfully.">
            <MarketplaceTable
              emptyMessage="No completed deliveries yet."
              rows={completedTasks}
              columns={[
                { key: 'id',      label: 'Task' },
                { key: 'harvest', label: 'Harvest', render: (row) => row.harvest?.cropName || '-' },
                { key: 'demand',  label: 'Demand',  render: (row) => row.demand?.cropName || '-' },
                { key: 'agent',   label: 'Agent',   render: (row) => row.assignedAgent?.name || '-' },
                {
                  key: 'actions',
                  label: 'Actions',
                  type: 'actions',
                  actions: (row) => [{ label: 'View Details', onClick: () => openTaskDetails(row.id) }],
                },
              ]}
            />
          </SectionCard>
        </TwoColGrid>

        <SectionCard title="Exceptions" subtitle="Rejected, stalled, or withdrawal tasks needing manual follow-up.">
          <MarketplaceTable
            emptyMessage="No exception tasks."
            rows={taskExceptions}
            columns={[
              { key: 'taskId',        label: 'Task' },
              { key: 'harvest',       label: 'Harvest',   render: (row) => row.task?.harvest?.cropName || '-' },
              { key: 'demand',        label: 'Demand',    render: (row) => row.task?.demand?.cropName || '-' },
              { key: 'agent',         label: 'Agent',     render: (row) => row.task?.assignedAgent?.name || '-' },
              { key: 'status',        label: 'Status',    type: 'status', render: (row) => row.task?.status || '-' },
              { key: 'exceptionType', label: 'Exception' },
              { key: 'reason',        label: 'Reason' },
              { key: 'ageHours',      label: 'Age (hrs)' },
              {
                key: 'actions',
                label: 'Actions',
                type: 'actions',
                actions: (row) => [
                  { label: 'Approve Change', onClick: () => handleApproveDemandChange(row.task?.demand?.id), disabled: row.exceptionType !== 'RETAILER_DEMAND_CHANGE_REQUEST' || loading },
                  { label: 'Reject Change',  onClick: () => handleRejectDemandChange(row.task?.demand?.id),  disabled: row.exceptionType !== 'RETAILER_DEMAND_CHANGE_REQUEST' || loading },
                  { label: 'Reassign',       onClick: () => openTaskReassignModal(row.task), disabled: !['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(row.task?.status) || row.exceptionType === 'FARMER_WITHDRAWAL_REQUEST' },
                  { label: 'Cancel',  color: 'error', onClick: () => openTaskCancelModal(row.task), disabled: ['DELIVERED', 'CANCELLED'].includes(row.task?.status) },
                  { label: 'Retry',          onClick: () => handleRetryTask(row.taskId), disabled: row.task?.status !== 'REJECTED' || ['FARMER_WITHDRAWAL_REQUEST', 'RETAILER_DEMAND_CHANGE_REQUEST'].includes(row.exceptionType) || loading },
                ],
              },
            ]}
          />
        </SectionCard>
      </WorkflowPanel>

      {/* ── Administration ── */}
      <WorkflowPanel active={activeTab} value="administration">
        <SectionCard title="User Management" subtitle="Create, update, or remove platform users.">
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" className="primary-button" onClick={openUserCreateModal}>
              Create User
            </Button>
          </Box>
          <MarketplaceTable
            emptyMessage="No users found."
            rows={users}
            columns={[
              { key: 'id',          label: 'ID' },
              { key: 'name',        label: 'Name' },
              { key: 'phoneNumber', label: 'Mobile' },
              { key: 'email',       label: 'Email' },
              { key: 'role',        label: 'Role', type: 'status' },
              {
                key: 'actions',
                label: 'Actions',
                type: 'actions',
                actions: (row) => [
                  { label: 'Edit',   onClick: () => openUserEditModal(row) },
                  { label: 'Delete', color: 'error', onClick: () => handleUserDelete(row.id), disabled: row.id === Number(session.userId) },
                ],
              },
            ]}
          />
        </SectionCard>
      </WorkflowPanel>

      {/* ── Generic modal ── */}
      <Dialog open={modal.open} onClose={modalLoading ? undefined : closeModal} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleModalSubmit}>
          <DialogTitle>{modal.title}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {modal.fields.map((field) => (
                <TextField
                  key={field.name}
                  select={field.select}
                  name={field.name}
                  label={field.label}
                  type={field.type || 'text'}
                  value={modal.values[field.name] ?? ''}
                  onChange={handleModalChange}
                  helperText={field.helperText || ''}
                  required={field.required}
                  fullWidth
                >
                  {field.select
                    ? field.options.map((opt) => {
                        const item = typeof opt === 'string' ? { value: opt, label: opt } : opt;
                        return <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>;
                      })
                    : null}
                </TextField>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal} disabled={modalLoading}>Cancel</Button>
            <Button type="submit" variant="contained" className="primary-button" disabled={modalLoading}>
              {modalLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── Task details modal ── */}
      <Dialog open={taskDetails.open} onClose={taskDetails.loading ? undefined : () => setTaskDetails(emptyTaskDetails)} fullWidth maxWidth="sm">
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          {taskDetails.loading ? (
            <Typography sx={{ pt: 1 }}>Loading...</Typography>
          ) : taskDetails.task ? (
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <Typography><strong>Task ID:</strong> {taskDetails.task.id}</Typography>
              <Typography><strong>Status:</strong> {taskDetails.task.status}</Typography>
              <Typography><strong>Harvest:</strong> {taskDetails.task.harvest?.cropName || '—'} (#{taskDetails.task.harvest?.id || '—'})</Typography>
              <Typography><strong>Harvest Qty:</strong> {taskDetails.task.harvest?.quantity ?? '—'}</Typography>
              <Typography><strong>Farmer:</strong> {taskDetails.task.harvest?.farmer?.name || '—'}</Typography>
              <Typography><strong>Demand:</strong> {taskDetails.task.demand?.cropName || '—'} (#{taskDetails.task.demand?.id || '—'})</Typography>
              <Typography><strong>Demand Qty:</strong> {taskDetails.task.demand?.quantity ?? '—'}</Typography>
              <Typography><strong>Retailer:</strong> {taskDetails.task.demand?.retailer?.name || '—'}</Typography>
              <Typography><strong>Agent:</strong> {taskDetails.task.assignedAgent?.name || '—'}</Typography>
              <Typography><strong>Assigned By:</strong> {taskDetails.task.assignedBy?.name || '—'}</Typography>
              <Typography><strong>Assigned At:</strong> {formatDateTime(taskDetails.task.assignedAt)}</Typography>
              <Typography><strong>Accepted At:</strong> {formatDateTime(taskDetails.task.acceptedAt)}</Typography>
              <Typography><strong>Picked Up At:</strong> {formatDateTime(taskDetails.task.pickedUpAt)}</Typography>
              <Typography><strong>In Transit At:</strong> {formatDateTime(taskDetails.task.inTransitAt)}</Typography>
              <Typography><strong>Delivered At:</strong> {formatDateTime(taskDetails.task.deliveredAt)}</Typography>
              {taskDetails.task.rejectionReason && (
                <Typography><strong>Note:</strong> {taskDetails.task.rejectionReason}</Typography>
              )}
            </Stack>
          ) : (
            <Typography sx={{ pt: 1 }}>No details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDetails(emptyTaskDetails)} disabled={taskDetails.loading}>Close</Button>
        </DialogActions>
      </Dialog>
    </DashboardShell>
  );
}

export default AdminDashboard;
