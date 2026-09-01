import axios from 'axios';

const API = axios.create({
  baseURL: 'https://mern-hackathon-backend.vercel.app',
  withCredentials: true
});

export default API;