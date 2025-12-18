import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { handleApiError } from "./src/utils/errorHandler";

export const HOST =
  document.location.hostname === "localhost"
    ? import.meta.env.VITE_API_URL
    : document.location.origin + "/api";

const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  config.params = {
    ...config.params,
    // _t: Date.now(),
  };

  config.headers.set("Content-Type", "application/json");
  config.headers.set("Accept", "application/json");

  return config;
};

const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

const errorInterceptor = (error: unknown) => {
  const apiError = handleApiError(error);

  if (import.meta.env.DEV) {
    console.error("API Error:", apiError);
  }

  if (apiError.type === "AUTHENTICATION_ERROR") {
    localStorage.clear();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return Promise.reject(apiError);
};

export const api = (baseURL?: string) => {
  const baseURLToUse = baseURL || HOST;

  const axiosInstance = axios.create({
    baseURL: baseURLToUse,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  axiosInstance.interceptors.request.use(requestInterceptor);
  axiosInstance.interceptors.response.use(
    responseInterceptor,
    errorInterceptor
  );

  return axiosInstance;
};
