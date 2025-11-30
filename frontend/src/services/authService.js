import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const getEmployees = async () => {
  const response = await api.get('/employees');
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

