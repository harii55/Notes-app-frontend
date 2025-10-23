import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
};

export const notesAPI = {
  getNotes: (params = {}) => api.get('/notes', { params }),
  getNote: (id) => api.get(`/notes/${id}`),
  createNote: (note) => api.post('/notes', note),
  updateNote: (id, note) => api.patch(`/notes/${id}`, note),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  pinNote: (id) => api.post(`/notes/${id}/pin`),
  unpinNote: (id) => api.post(`/notes/${id}/unpin`),
  archiveNote: (id) => api.post(`/notes/${id}/archive`),
  unarchiveNote: (id) => api.post(`/notes/${id}/unarchive`),
};

export const shareAPI = {
  createShareLink: (noteId) => api.post(`/s/note/${noteId}`),
  deleteShareLink: (noteId) => api.delete(`/s/note/${noteId}`),
  getSharedNote: (token) => axios.get(`${API_BASE_URL}/s/${token}`),
};

export default api;