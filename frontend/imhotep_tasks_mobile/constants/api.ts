import axios from 'axios';

// 1. Read the variable from the environment
// If the variable is missing (e.g. you forgot the .env file), fallback to localhost for safety
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.253:8000';

// 2. Log it so you can see which one is being used in your terminal
console.log(`🚀 Connecting to Backend at: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;