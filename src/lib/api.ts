import axios, { AxiosInstance } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_STAFF_PORTAL,
  timeout: 10000,
});

export const createApiInstance = (
  baseURL: string,
  headers?: Record<string, string>
): AxiosInstance => {
  return axios.create({
    baseURL,
    timeout: 20000,
    headers: headers || {
      'Content-Type': 'application/json',
    },
  });
};

export default api;
