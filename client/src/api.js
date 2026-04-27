import axios from 'axios';

// In production (Vercel): VITE_API_URL = your Render backend URL
//   e.g. https://arvr-store-backend.onrender.com
// In development: leave VITE_API_URL empty → axios uses Vite proxy at /api
const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
