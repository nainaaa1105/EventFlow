import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ef_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser    = (data) => API.post('/auth/login', data);

// ── Events ────────────────────────────────────────
export const getEvents     = (category) =>
  API.get('/events', { params: category && category !== 'All' ? { category } : {} });

export const getEventById  = (id)   => API.get(`/events/${id}`);
export const createEvent   = (data) => API.post('/events', data);
export const updateEvent   = (id, data) => API.put(`/events/${id}`, data);

// ── RSVP ──────────────────────────────────────────
export const rsvpEvent = (id) => API.post(`/events/${id}/rsvp`);

export default API;
