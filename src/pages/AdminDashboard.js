import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import DashboardShell from '../components/DashboardShell';
import MarketplaceTable from '../components/MarketplaceTable';
import SectionCard from '../components/SectionCard';
import { getSession } from '../utils/session';

const emptyAssignment = {
  harvestId: '',
  demandId: '',
  agentId: '',
};

function AdminDashboard() {
  const session = getSession();
  const [harvests, setHarvests] = useState([]);
  const [demands, setDemands] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignment, setAssignment] = useState(emptyAssignment);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [harvestResponse, demandResponse, taskResponse, userResponse] = await Promise.all([
        axiosInstance.get(`/api/admins/${session.userId}/harvests`),
        axiosInstance.get(`/api/admins/${session.userId}/demands`),
        axiosInstance.get(`/api/admins/${session.userId}/tasks`),
        axiosInstance.get(`/api/admins/${session.userId}/users`),
      ]);

      setHarvests(harvestResponse.data);
      setDemands(demandResponse.data);
      setTasks(taskResponse.data);
      setUsers(userResponse.data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Unable to load admin marketplace data.' });
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const agentUsers = useMemo(() => users.filter((user) => user.role === 'AGENT'), [users]);
  const availableHarvests = useMemo(() => harvests.filter((item) => item.status === 'AVAILABLE'), [harvests]);
  const openDemands = useMemo(() => demands.filter((item) => item.status === 'OPEN'), [demands]);
  const canAssignTask = availableHarvests.length > 0 && openDemands.length > 0 && agentUsers.length > 0;

  const stats = useMemo(() => [
    { label: 'All harvests', value: harvests.length, note: 'Marketplace supply records' },
    { label: 'All demands', value: demands.length, note: 'Marketplace demand records' },
    { label: 'Assignments', value: tasks.length, note: 'Delivery tasks created so far' },
    { label: 'Users', value: users.length, note: 'Managed across all roles' },
  ], [demands.length, harvests.length, tasks.length, users.length]);

  const handleAssignmentChange = (event) => {
    const { name, value } = event.target;
    setAssignment((current) => ({ ...current, [name]: value }));
  };

  const handleAssign = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await axiosInstance.post(`/api/admins/${session.userId}/tasks`, {
        adminId: Number(session.userId),
        agentId: Number(assignment.agentId),
        harvestId: Number(assignment.harvestId),
        demandId: Number(assignment.demandId),
      });

      setAssignment(emptyAssignment);
      setStatus({ type: 'success', message: 'Task assigned to agent.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to assign task.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUserEdit = async (user) => {
    const username = window.prompt('Update username', user.username || '');
    if (username === null) {
      return;
    }

    const role = window.prompt('Update role (ADMIN, FARMER, RETAILER, AGENT)', user.role || '');
    if (role === null) {
      return;
    }

    const password = window.prompt('Optional new password (leave blank to keep current password)', '');

    try {
      await axiosInstance.put(`/api/admins/${session.userId}/users/${user.id}`, {
        username: username.trim(),
        role: role.trim().toUpperCase(),
        password: password || '',
      });
      setStatus({ type: 'success', message: 'User updated.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to update user.' });
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/admins/${session.userId}/users/${userId}`);
      setStatus({ type: 'success', message: 'User deleted.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to delete user.' });
    }
  };

  const handleHarvestEdit = async (harvest) => {
    const cropName = window.prompt('Update crop name', harvest.cropName || '');
    if (cropName === null) {
      return;
    }

    const quantity = window.prompt('Update quantity', String(harvest.quantity || ''));
    if (quantity === null) {
      return;
    }

    const harvestDate = window.prompt('Update harvest date (YYYY-MM-DD)', harvest.harvestDate || '');
    if (harvestDate === null) {
      return;
    }

    const expectedPrice = window.prompt('Update expected price', String(harvest.expectedPrice || ''));
    if (expectedPrice === null) {
      return;
    }

    try {
      await axiosInstance.put(`/api/admins/${session.userId}/harvests/${harvest.id}`, {
        cropName: cropName.trim(),
        quantity: Number(quantity),
        harvestDate,
        expectedPrice: Number(expectedPrice),
      });
      setStatus({ type: 'success', message: 'Harvest updated.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to update harvest.' });
    }
  };

  const handleHarvestDelete = async (harvestId) => {
    if (!window.confirm('Delete this harvest?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/admins/${session.userId}/harvests/${harvestId}`);
      setStatus({ type: 'success', message: 'Harvest deleted.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to delete harvest.' });
    }
  };

  const handleDemandEdit = async (demand) => {
    const cropName = window.prompt('Update crop name', demand.cropName || '');
    if (cropName === null) {
      return;
    }

    const quantity = window.prompt('Update quantity', String(demand.quantity || ''));
    if (quantity === null) {
      return;
    }

    const requiredDate = window.prompt('Update required date (YYYY-MM-DD)', demand.requiredDate || '');
    if (requiredDate === null) {
      return;
    }

    const targetPrice = window.prompt('Update target price', String(demand.targetPrice || ''));
    if (targetPrice === null) {
      return;
    }

    try {
      await axiosInstance.put(`/api/admins/${session.userId}/demands/${demand.id}`, {
        cropName: cropName.trim(),
        quantity: Number(quantity),
        requiredDate,
        targetPrice: Number(targetPrice),
      });
      setStatus({ type: 'success', message: 'Demand updated.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to update demand.' });
    }
  };

  const handleDemandDelete = async (demandId) => {
    if (!window.confirm('Delete this demand?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/admins/${session.userId}/demands/${demandId}`);
      setStatus({ type: 'success', message: 'Demand deleted.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to delete demand.' });
    }
  };

  const handleTaskEdit = async (task) => {
    const agentId = window.prompt('Reassign to agent ID', String(task.assignedAgent?.id || ''));
    if (agentId === null) {
      return;
    }

    try {
      await axiosInstance.put(`/api/admins/${session.userId}/tasks/${task.id}`, {
        agentId: Number(agentId),
      });
      setStatus({ type: 'success', message: 'Task updated.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to update task.' });
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Delete this delivery task?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/admins/${session.userId}/tasks/${taskId}`);
      setStatus({ type: 'success', message: 'Task deleted.' });
      fetchAdminData();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to delete task.' });
    }
  };

  return (
    <DashboardShell
      role="ADMIN"
      title="Admin Dashboard"
      subtitle={`Logged in as ${session.username}. Oversee supply, demand, matching, and delivery assignments.`}
      stats={stats}
    >
      <Box className="dashboard-grid dashboard-grid--admin">
        <SectionCard title="Match harvest with demand" subtitle="Choose one available harvest, one open demand, and an agent.">
          <Stack spacing={2} component="form" onSubmit={handleAssign}>
            {status.message ? <Alert severity={status.type || 'info'}>{status.message}</Alert> : null}
            <TextField
              select
              label="Harvest"
              name="harvestId"
              value={assignment.harvestId}
              onChange={handleAssignmentChange}
              helperText={availableHarvests.length === 0 ? 'No available harvests found.' : ''}
              required
            >
              {availableHarvests.length === 0 ? (
                <MenuItem value="" disabled>
                  No available harvests
                </MenuItem>
              ) : null}
              {availableHarvests.map((harvest) => (
                <MenuItem key={harvest.id} value={harvest.id}>
                  #{harvest.id} {harvest.cropName} | Farmer {harvest.farmer?.username} | Qty {harvest.quantity}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Demand"
              name="demandId"
              value={assignment.demandId}
              onChange={handleAssignmentChange}
              helperText={openDemands.length === 0 ? 'No open demands available. Create a retailer demand first or free a reserved one.' : ''}
              required
            >
              {openDemands.length === 0 ? (
                <MenuItem value="" disabled>
                  No open demands available
                </MenuItem>
              ) : null}
              {openDemands.map((demand) => (
                <MenuItem key={demand.id} value={demand.id}>
                  #{demand.id} {demand.cropName} | Retailer {demand.retailer?.username} | Qty {demand.quantity}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Agent"
              name="agentId"
              value={assignment.agentId}
              onChange={handleAssignmentChange}
              helperText={agentUsers.length === 0 ? 'No agent users found.' : ''}
              required
            >
              {agentUsers.length === 0 ? (
                <MenuItem value="" disabled>
                  No agents available
                </MenuItem>
              ) : null}
              {agentUsers.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  #{agent.id} {agent.username}
                </MenuItem>
              ))}
            </TextField>

            <Button type="submit" variant="contained" className="primary-button" disabled={loading || !canAssignTask}>
              {loading ? 'Assigning...' : 'Assign Task'}
            </Button>
          </Stack>
        </SectionCard>

        <SectionCard title="All assignments" subtitle="Track every delivery task and its current status.">
          <MarketplaceTable
            emptyMessage="No assignments have been created yet."
            rows={tasks}
            columns={[
              { key: 'id', label: 'Task' },
              { key: 'harvest', label: 'Harvest', render: (row) => `${row.harvest?.cropName || '-'} (#${row.harvest?.id || '-'})` },
              { key: 'demand', label: 'Demand', render: (row) => `${row.demand?.cropName || '-'} (#${row.demand?.id || '-'})` },
              { key: 'agent', label: 'Agent', render: (row) => row.assignedAgent?.username || '-' },
              { key: 'status', label: 'Status', type: 'status' },
              {
                key: 'actions',
                label: 'Actions',
                type: 'actions',
                actions: (row) => [
                  { label: 'Reassign', onClick: () => handleTaskEdit(row) },
                  { label: 'Delete', color: 'error', onClick: () => handleTaskDelete(row.id) },
                ],
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="All harvests" subtitle="Visible across the marketplace for admin review.">
          <MarketplaceTable
            emptyMessage="No harvest records found."
            rows={harvests}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'cropName', label: 'Product' },
              { key: 'farmer', label: 'Farmer', render: (row) => row.farmer?.username || '-' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'expectedPrice', label: 'Price' },
              { key: 'status', label: 'Status', type: 'status' },
              {
                key: 'actions',
                label: 'Actions',
                type: 'actions',
                actions: (row) => [
                  { label: 'Edit', onClick: () => handleHarvestEdit(row) },
                  { label: 'Delete', color: 'error', onClick: () => handleHarvestDelete(row.id) },
                ],
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="All demands" subtitle="Visible across the marketplace for admin review.">
          <MarketplaceTable
            emptyMessage="No demand records found."
            rows={demands}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'cropName', label: 'Product' },
              { key: 'retailer', label: 'Retailer', render: (row) => row.retailer?.username || '-' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'targetPrice', label: 'Target price' },
              { key: 'status', label: 'Status', type: 'status' },
              {
                key: 'actions',
                label: 'Actions',
                type: 'actions',
                actions: (row) => [
                  { label: 'Edit', onClick: () => handleDemandEdit(row) },
                  { label: 'Delete', color: 'error', onClick: () => handleDemandDelete(row.id) },
                ],
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="All users" subtitle="Manage platform users across all roles.">
          <MarketplaceTable
            emptyMessage="No users found."
            rows={users}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'username', label: 'Username' },
              { key: 'role', label: 'Role', type: 'status' },
              {
                key: 'actions',
                label: 'Actions',
                type: 'actions',
                actions: (row) => [
                  { label: 'Edit', onClick: () => handleUserEdit(row) },
                  { label: 'Delete', color: 'error', onClick: () => handleUserDelete(row.id), disabled: row.id === Number(session.userId) },
                ],
              },
            ]}
          />
        </SectionCard>
      </Box>
    </DashboardShell>
  );
}

export default AdminDashboard;
