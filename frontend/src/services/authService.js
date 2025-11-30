import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const getEmployees = async () => {
  const response = await api.get('/employees');
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await api.post('/employees', employeeData);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/employees/${id}`, employeeData);
  return response.data;
};

export const getShifts = async (employee = null, date = null) => {
  const params = {};
  if (employee) params.employee = employee;
  if (date) params.date = date;
  const response = await api.get('/shifts', { params });
  return response.data;
};

export const createShift = async (shiftData) => {
  const response = await api.post('/shifts', shiftData);
  return response.data;
};

export const deleteShift = async (id) => {
  const response = await api.delete(`/shifts/${id}`);
  return response.data;
};

export const updateShift = async (id, shiftData) => {
  const response = await api.put(`/shifts/${id}`, shiftData);
  return response.data;
};

export const getWorkingHours = async () => {
  const response = await api.get('/shifts/working-hours');
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

export const loginEmployee = async (email, password) => {
  return login(email, password);
};

export const loginAdmin = async (email, password) => {
  return login(email, password);
};

export const createBulkShifts = async (shifts) => {
  // Create shifts in batches
  const batchSize = 10;
  const results = [];
  for (let i = 0; i < shifts.length; i += batchSize) {
    const batch = shifts.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(shift => createShift(shift)));
    results.push(...batchResults);
  }
  return results;
};

export const createRecurringShifts = async (shifts) => {
  // Create shifts in batches
  const batchSize = 10;
  const results = [];
  for (let i = 0; i < shifts.length; i += batchSize) {
    const batch = shifts.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(shift => createShift(shift)));
    results.push(...batchResults);
  }
  return results;
};

export const getIssues = async () => {
  const response = await api.get('/issues');
  return response.data;
};

export const getUnreadIssueCount = async () => {
  const response = await api.get('/issues/unread-count');
  return response.data;
};

export const getIssueById = async (id) => {
  const response = await api.get(`/issues/${id}`);
  return response.data;
};

export const createIssue = async (issueData) => {
  const response = await api.post('/issues', issueData);
  return response.data;
};

export const updateIssue = async (id, issueData) => {
  const response = await api.put(`/issues/${id}`, issueData);
  return response.data;
};

export const deleteIssue = async (id) => {
  const response = await api.delete(`/issues/${id}`);
  return response.data;
};

export const getDashboardAnalytics = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get('/analytics/dashboard', { params });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

