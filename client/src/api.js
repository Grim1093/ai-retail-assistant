import axios from 'axios';

// Use the environment variable if available (for Vercel), otherwise localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_URL,
});

export default API;