import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const createEvent = (eventData) => axios.post(`${API_URL}/events`, eventData);

export const getEvents = () => axios.get(`${API_URL}/events`);

export const getEventDetails = (eventId) => axios.get(`${API_URL}/events/${eventId}`);

export const updateEvent = (eventId, updates) => axios.put(`${API_URL}/events/${eventId}`, updates);

export const uploadTicket = (eventId, file) => {
  const formData = new FormData();
  formData.append('ticket', file);
  return axios.post(`${API_URL}/events/${eventId}/ticket`, formData);
};

export const startVideoCall = (eventId) => axios.post(`${API_URL}/events/${eventId}/video-call/start`);

export const endVideoCall = (eventId) => axios.post(`${API_URL}/events/${eventId}/video-call/end`);

export const verifyQRAccess = (qrData) => axios.post(`${API_URL}/events/video-call/verify`, { qrData });
