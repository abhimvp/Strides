import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// This is an "interceptor", a function that runs before each request is sent.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // If a token exists, add it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
