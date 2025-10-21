import api from '../lib/api';

const basePath = '/subdomain/holidays';

export const listHolidays = async (params = {}) => {
  const res = await api.get(basePath, { params });
  return res.data;
};

export const createHoliday = async (payload) => {
  const res = await api.post(basePath, payload);
  return res.data;
};

export const updateHoliday = async (holidayId, payload) => {
  const res = await api.put(`${basePath}/${holidayId}`, payload);
  return res.data;
};

export const deleteHoliday = async (holidayId) => {
  const res = await api.delete(`${basePath}/${holidayId}`);
  return res.data;
};

export default {
  listHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
};