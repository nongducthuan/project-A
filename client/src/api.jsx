// api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Đảm bảo dấu cách giữa Bearer và token là chính xác
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;