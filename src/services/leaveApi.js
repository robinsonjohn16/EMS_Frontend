import api from '../lib/api';

const basePath = '/tenant/leaves';

const leaveApi = {
  // Employee leave routes
  getEmployeeLeaves: async (employeeId, params = {}) => {
    const res = await api.get(`${basePath}/employee/${employeeId}`, { params });
    return res.data;
  },

  applyLeave: async (employeeId, organizationId, leaveData) => {
    const res = await api.post(`${basePath}/employee/${employeeId}/${organizationId}/apply`, leaveData);
    return res.data;
  },

  getLeaveQuota: async (employeeId, organizationId, params = {}) => {
    const res = await api.get(`${basePath}/quota/${employeeId}/${organizationId}`, { params });
    return res.data;
  },

  // HR leave management routes
  getOrganizationLeaves: async (organizationId, params = {}) => {
    const res = await api.get(`${basePath}/organization/${organizationId}`, { params });
    return res.data;
  },

  processLeaveRequest: async (leaveId, processData) => {
    const res = await api.put(`${basePath}/process/${leaveId}`, processData);
    return res.data;
  },

  cancelLeave: async (leaveId, cancelData = {}) => {
    const res = await api.put(`${basePath}/cancel/${leaveId}`, cancelData);
    return res.data;
  },

  updateLeaveQuota: async (employeeId, organizationId, quotaData) => {
    const res = await api.put(`${basePath}/quota/${employeeId}/${organizationId}`, quotaData);
    return res.data;
  },
};

export default leaveApi;