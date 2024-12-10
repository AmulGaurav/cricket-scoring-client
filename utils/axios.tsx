import axios from "axios";

export const apiClient2 = axios.create({
  baseURL: process.env.BACKEND_URL || "http://localhost:3001",
});

export const apiClient = axios.create({
  baseURL: process.env.BACKEND_URL || "http://localhost:3001/api/v1",
});
