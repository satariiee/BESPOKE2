// ============================================
// API Client untuk Frontend Integration
// ============================================
//
// File: src/lib/api.ts (atau sesuaikan path)
// Ini adalah contoh implementasi API client untuk
// mengintegrasikan authentication dengan backend Laravel

import axios, { AxiosInstance, AxiosError } from "axios";

// ============================================
// Configuration
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ============================================
// Type Definitions
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "staff";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// API Client Class
// ============================================

class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Load token dari localStorage
    this.token = localStorage.getItem("api_token");

    // Add Authorization header interceptor
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Error handling interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token invalid atau expired, lakukan logout
          this.logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  // ============================================
  // Authentication Methods
  // ============================================

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.axiosInstance.post<LoginResponse>("/login", credentials);

    // Store token
    this.token = response.data.data.token;
    localStorage.setItem("api_token", this.token);
    localStorage.setItem("user", JSON.stringify(response.data.data.user));

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.axiosInstance.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear token locally
      this.token = null;
      localStorage.removeItem("api_token");
      localStorage.removeItem("user");
    }
  }

  async getProfile(): Promise<{ data: User }> {
    const response = await this.axiosInstance.get<{ data: User }>("/profile");
    return response.data;
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await this.axiosInstance.post<LoginResponse>("/refresh-token");

    // Update token
    this.token = response.data.data.token;
    localStorage.setItem("api_token", this.token);

    return response.data;
  }

  // ============================================
  // Generic Request Methods
  // ============================================

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  // ============================================
  // Helper Methods
  // ============================================

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem("api_token", token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

// ============================================
// Export Singleton Instance
// ============================================

export const apiClient = new ApiClient();

// ============================================
// Usage Examples
// ============================================

/*
// 1. Login
try {
  const response = await apiClient.login({
    email: 'admin@jemaah.com',
    password: 'admin123'
  });
  console.log('User:', response.data.user);
  console.log('Token:', response.data.token);
} catch (error) {
  console.error('Login failed:', error);
}

// 2. Get Profile
try {
  const profile = await apiClient.getProfile();
  console.log('Profile:', profile.data);
} catch (error) {
  console.error('Failed to get profile:', error);
}

// 3. Logout
await apiClient.logout();

// 4. Make Generic API Calls
try {
  const jemaah = await apiClient.get('/calon-jemaah');
  console.log('Jemaah list:', jemaah);
} catch (error) {
  console.error('Failed to fetch jemaah:', error);
}

// 5. Create Resource
try {
  const newJemaah = await apiClient.post('/calon-jemaah', {
    nama: 'John Doe',
    kontak: '081234567890',
    alamat: 'Jl. Merdeka No. 1',
    sumber: 'Social Media'
  });
  console.log('Created:', newJemaah);
} catch (error) {
  console.error('Failed to create jemaah:', error);
}

// 6. Refresh Token
try {
  const response = await apiClient.refreshToken();
  console.log('New token:', response.data.token);
} catch (error) {
  console.error('Failed to refresh token:', error);
}

// 7. Check Authentication
if (apiClient.isAuthenticated()) {
  const user = apiClient.getCurrentUser();
  console.log('Logged in as:', user?.name);
}
*/

export default apiClient;
