import axios from "axios";
import Cookies from "js-cookie";

const url = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: url,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
