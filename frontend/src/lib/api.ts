import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      // Emit custom event instead of hard reload
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface SignUpData {
  name: string;
  lName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  lName: string;
  email: string;
  role: string;
}

export interface Problem {
  _id: string;
  title: string;
  link: string;
  done: boolean;
  userId: string;
  cycleNumber: number;
  createdAt: string;
  completedAt?: string;
}

export interface Stats {
  total: number;
  completed: number;
  remaining: number;
  progress: number;
}

class ApiService {
  // Authentication
  async signUp(data: SignUpData) {
    const response = await api.post("/api/register", data);
    return response.data as ApiResponse<AuthResponse>;
  }

  async signIn(data: SignInData) {
    const response = await api.post("/api/login", data);
    return response.data as ApiResponse<AuthResponse>;
  }

  async logout() {
    try {
      // Optional: call backend logout endpoint if it exists
      await api.post("/api/logout");
    } catch {
      // Ignore errors - we'll clear local session anyway
      console.log("Backend logout failed, clearing local session");
    }
  }

  // Problems
  async getMyProblems() {
    const response = await api.get("/api/my-problems");
    return response.data as ApiResponse<Problem[]>;
  }

  async getStats() {
    const response = await api.get("/api/problem-stats");
    return response.data as ApiResponse<Stats>;
  }

  async generateProblems() {
    const response = await api.get("/api/generate-problems");
    return response.data as ApiResponse<Problem[]>;
  }

  async markAsDone(problemId: string) {
    const response = await api.post("/api/mark-done", { problemId });
    return response.data as ApiResponse<boolean>;
  }

  async resetCycle() {
    const response = await api.post("/api/reset-cycle");
    return response.data as ApiResponse<boolean>;
  }

  async deleteAllProblems() {
    const response = await api.post("/api/delete-all-problems");
    return response.data as ApiResponse<boolean>;
  }

  async uploadProblems(file: File) {
    const formData = new FormData();
    formData.append("excelFile", file);

    const response = await api.post("/api/upload-problems", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // User
  async getUserById(id: string) {
    const response = await api.get(`/api/get-by-id/${id}`);
    return response.data as ApiResponse<User>;
  }

  async updateUser(id: string, data: Partial<User>) {
    const response = await api.post(`/api/update-by-id/${id}`, data);
    return response.data as ApiResponse<User>;
  }
}

export const apiService = new ApiService();
export default api;
