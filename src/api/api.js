import axios from "axios";
const urlBase = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: urlBase,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});

let authToken = null;
let authProprietarioId = null;

export function setAuthHeaders(token, proprietarioId) {
  authToken = token;
  authProprietarioId = proprietarioId;
}

api.interceptors.request.use(
  (config) => {
    var lang = sessionStorage.getItem("lang") ?? "ptbr";
    if (lang) {
      config.headers["Accept-Language"] = lang;
    }
    var stored = sessionStorage.getItem("auth");
    if (stored) {
      const data = JSON.parse(stored);
      if (data.token) {
        config.headers.Authorization = `Bearer ${data.token}`;
      }

      if (data.userId) {
        config.headers["user-id"] = data.userId;
      }

      if (data.proprietarioId) {
        config.headers["proprietario-id"] = data.proprietarioId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
