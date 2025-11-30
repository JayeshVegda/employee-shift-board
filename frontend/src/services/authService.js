import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const loginEmployee = async (email, password) => {
  const response = await api.post('/login/employee', { email, password });
  return response.data;
};

export const loginAdmin = async (email, password) => {
  const response = await api.post('/login/admin', { email, password });
  return response.data;
};

export const getEmployees = async () => {
  const response = await api.get('/employees');
  return response.data;
};

export const getShifts = async (employee = null, date = null, department = null, sortBy = null, sortOrder = null, month = null, year = null, page = 1, limit = 10) => {
  const params = {};
  if (employee) params.employeeId = employee;
  if (date) params.date = date;
  if (department) params.department = department;
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;
  if (month) params.month = month;
  if (year) params.year = year;
  params.page = page;
  params.limit = limit;
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

export const createEmployee = async (employeeData) => {
  const response = await api.post('/employees', employeeData);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/employees/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

export const getWorkingHours = async (startDate = null, endDate = null, employeeId = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (employeeId) params.employeeId = employeeId;
  const response = await api.get('/shifts/working-hours', { params });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/login/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const createIssue = async (issueData) => {
  const response = await api.post('/issues', issueData);
  return response.data;
};

export const getIssues = async (status = null, priority = null, page = 1, pageSize = 25) => {
  const params = {};
  if (status) params.status = status;
  if (priority) params.priority = priority;
  params.page = page;
  params.pageSize = pageSize;
  const response = await api.get('/issues', { params });
  return response.data;
};

export const getIssueById = async (id) => {
  const response = await api.get(`/issues/${id}`);
  return response.data;
};

export const updateIssue = async (id, issueData) => {
  const response = await api.put(`/issues/${id}`, issueData);
  return response.data;
};

export const getUnreadIssueCount = async () => {
  const response = await api.get('/issues/unread-count');
  return response.data;
};

export const markIssueAsRead = async (id) => {
  const response = await api.patch(`/issues/${id}/read`);
  return response.data;
};

export const updateShift = async (id, shiftData) => {
  const response = await api.put(`/shifts/${id}`, shiftData);
  return response.data;
};

export const deleteIssue = async (id) => {
  const response = await api.delete(`/issues/${id}`);
  return response.data;
};

export const getDashboardAnalytics = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get('/analytics/dashboard', { params });
  return response.data;
};
