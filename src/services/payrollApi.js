import apiClient from '../lib/api';

const payrollApi = {
  // Compensation
  getCompensation: async (userId) => {
    const res = await apiClient.get(`/subdomain/payroll/compensation/${userId}`);
    return res.data?.data || res.data;
  },
  upsertCompensation: async (userId, payload) => {
    const res = await apiClient.post(`/subdomain/payroll/compensation/${userId}`, payload);
    return res.data?.data || res.data;
  },

  // Deduction rules
  listDeductionRules: async () => {
    const res = await apiClient.get('/subdomain/payroll/deduction-rules');
    return res.data?.data || res.data;
  },
  upsertDeductionRule: async (payload) => {
    const res = await apiClient.post('/subdomain/payroll/deduction-rules', payload);
    return res.data?.data || res.data;
  },
  deleteDeductionRule: async (code) => {
    const res = await apiClient.delete(`/subdomain/payroll/deduction-rules/${code}`);
    return res.data?.data || res.data;
  },
  getDeductionSuggestions: async (salary) => {
    const params = new URLSearchParams();
    if (salary != null) params.append('salary', String(salary));
    const res = await apiClient.get(`/subdomain/payroll/deduction-suggestions?${params.toString()}`);
    return res.data?.data || res.data;
  },

  // Salary slips
  generateSlip: async ({ userId, year, month }) => {
    const res = await apiClient.post('/subdomain/payroll/slips/generate', { userId, year, month });
    return res.data?.data || res.data;
  },
  getSlip: async (userId, year, month) => {
    const res = await apiClient.get(`/subdomain/payroll/slips/${userId}/${year}/${month}`);
    return res.data?.data || res.data;
  },
  updateSlip: async (userId, year, month, payload) => {
    const res = await apiClient.put(`/subdomain/payroll/slips/${userId}/${year}/${month}`, payload);
    return res.data?.data || res.data;
  },
  finalizeSlip: async (userId, year, month) => {
    const res = await apiClient.post(`/subdomain/payroll/slips/${userId}/${year}/${month}/finalize`);
    return res.data?.data || res.data;
  },

  // Salary slip PDFs
  generateSlipPDF: async (userId, year, month) => {
    const res = await apiClient.post(`/subdomain/payroll/slips/${userId}/${year}/${month}/pdf`);
    return res.data?.data || res.data;
  },
  getSlipPDF: async (userId, year, month) => {
    const res = await apiClient.get(`/subdomain/payroll/slips/${userId}/${year}/${month}/pdf`);
    return res.data?.data || res.data;
  }
};

export default payrollApi;