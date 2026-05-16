import axios from "axios";
import Cookies from "js-cookie";
import { CreateSitePayload, Site } from "@/types/site";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://6mv5kgfg-8000.uks1.devtunnels.ms/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach the JWT token to every request.
// js-cookie is already installed in your project.
// Update the cookie key name below if yours differs (check your ProtectedRoute or auth logic).
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token"); // ← change key if needed
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirects to sign in
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export async function fetchSites(): Promise<Site[]> {
  const { data } = await api.get("/sites/list");
  // Handles both a plain array and a paginated { data: [...] } response shape
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function createSite(payload: CreateSitePayload): Promise<Site> {
  const { data } = await api.post("/sites/create", payload);
  return data;
}