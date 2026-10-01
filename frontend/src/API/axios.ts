import axios from "axios";
//http://localhost:5000/
const api = axios.create({
  baseURL: "https://arabic-learning-web-app.onrender.com", // 🔥 باك إند
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
