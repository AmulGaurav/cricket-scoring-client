import axios from "axios";

export const apiClient2 = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
});

export const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1" ||
    "http://localhost:3001/api/v1",
});
