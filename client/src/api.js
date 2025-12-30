import axios from 'axios';

// This creates an instance of axios with the base URL for Pawan's backend
const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

export default API;