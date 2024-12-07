import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.BACKEND_URL || "http://localhost:3001/api/v1",
});
