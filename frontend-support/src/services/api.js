// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1118/api';
// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const api = {
  // Create a new ticket
  createTicket: async (ticketData) => {
    try {
      const response = await apiClient.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Get all tickets
  getAllTickets: async () => {
    try {
      const response = await apiClient.get('/tickets');
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  // Get tickets by learnerId
  getTicketsByLearnerId: async (learnerId) => {
    try {
      const response = await apiClient.get(`/tickets/${learnerId}`);
      console.log('response', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching learner tickets:', error);
      throw error;
    }
  },

  // Get a single ticket by ID
  getTicketById: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/id/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      throw error;
    }
  },

  // Delete a ticket
  deleteTicket: async (ticketId) => {
    try {
      const response = await apiClient.delete(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  },

  // Resolve a ticket
  resolveTicket: async (ticketId) => {
    try {
      const response = await apiClient.patch(`/tickets/${ticketId}/resolve`);
      return response.data;
    } catch (error) {
      console.error('Error resolving ticket:', error);
      throw error;
    }
  },

  // Add a reply to a ticket
  addReplyToTicket: async (ticketId, replyData) => {
    try {
      const response = await apiClient.post(`/tickets/${ticketId}/replies`, replyData);
      return response.data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  }
};

export default api;