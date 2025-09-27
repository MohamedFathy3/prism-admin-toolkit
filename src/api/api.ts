// src/api/api.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosHeaders } from "axios";
import Cookies from "js-cookie";
import {
  User,
  Order,
  Product,
  Pack,
  Customer,
  LoginResponse,
  CheckAuthResponse,
} from "@/type/type";

const api = axios.create({
  baseURL: "/api", // backend
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return config;
});

export const apiFetch = async <T>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> => {
  const res: AxiosResponse<T> = await api({
    url: endpoint,
    method: options.method || "GET",
    data: options.data || null,
    ...options,
  });
  return res.data;
};

/* AUTH */
export const login = async (
  user_name: string,
  password: string
): Promise<LoginResponse> => {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    data: { user_name, password },
  });
  if (data.token) {
    Cookies.set("token", data.token, { path: "/" });
  }
  return data;
};

export const checkAuth = (): Promise<CheckAuthResponse> =>
  apiFetch<CheckAuthResponse>("/auth/check-auth");
