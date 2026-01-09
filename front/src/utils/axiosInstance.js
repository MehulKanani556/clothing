import axios from "axios";
import { BASE_URL } from "./BASE_URL";
import { logout } from "../redux/slice/auth.slice";

const userId = localStorage.getItem("userId");

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = { ...error.config };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("generateNewTokens")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const response = await axios.post(
          `${BASE_URL}/generateNewTokens`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
            withCredentials: true,
          }
        );

        const newToken = response.data.accessToken;

        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // ✅ THIS LINE WAS MISSING / FAILING
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        const { store } = require("../redux/Store").configureStore();
        store.dispatch(logout());
        // alert("Logout");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;