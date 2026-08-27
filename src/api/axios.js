import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://136.110.213.76:80/api/v1',
});

export default API;