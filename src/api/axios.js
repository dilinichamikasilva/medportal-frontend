import axios from 'axios';

const API = axios.create({
  baseURL: 'http://34.93.241.18:8080/api/v1',
});

export default API;