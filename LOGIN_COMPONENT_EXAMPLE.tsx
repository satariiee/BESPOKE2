// ============================================
// Example Login Component
// ============================================
// Letakkan file ini di: frontend/src/app/pages/LoginExample.tsx
// Ini adalah contoh implementasi login yang terhubung dengan API authentication

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/api"; // Sesuaikan dengan path yang benar

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginError {
  message: string;
  email?: string[];
  password?: string[];
}

export default function LoginExample() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<LoginError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call login API
      const response = await apiClient.login({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login successful:", response.data.user);

      // Redirect based on role
      if (response.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/staff/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      // Handle different error types
      if (err.response?.status === 422) {
        // Validation error
        setError({
          message: err.response?.data?.message || "Login gagal",
          ...err.response?.data?.errors,
        });
      } else if (err.response?.status === 401) {
        setError({
          message: "Email atau password salah",
        });
      } else {
        setError({
          message: "Terjadi kesalahan pada server. Silakan coba lagi.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cream-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Jemaah Follow Up</h1>
            <p className="text-slate-600">Sistem Manajemen Follow Up Calon Jemaah</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium text-sm">{error.message}</p>
              {error.email && <p className="text-red-700 text-sm mt-1">• {error.email[0]}</p>}
              {error.password && <p className="text-red-700 text-sm">• {error.password[0]}</p>}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Masukkan email Anda"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Masukkan password Anda"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isLoading} className="w-full bg-teal-600 text-white font-semibold py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6">
              {isLoading ? "Loading..." : "Login"}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">Akun Demo:</p>
            <div className="space-y-1 text-sm text-blue-800">
              <p>
                <strong>Admin:</strong> admin@jemaah.com / admin123
              </p>
              <p>
                <strong>Staff:</strong> staff@jemaah.com / staff123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Usage dalam React Router
// ============================================
/*
Di file routes.tsx atau App.tsx:

import LoginExample from '@/app/pages/LoginExample';

const routes = [
  {
    path: '/login',
    element: <LoginExample />,
  },
  // ... other routes
];
*/

// ============================================
// Protected Route Component Example
// ============================================

interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: "admin" | "staff";
}

export function ProtectedRoute({ element, requiredRole }: ProtectedRouteProps) {
  const user = apiClient.getCurrentUser();
  const isAuthenticated = apiClient.isAuthenticated();

  if (!isAuthenticated || !user) {
    return <LoginExample />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Akses Ditolak</h1>
          <p className="text-slate-600 mb-4">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <button onClick={() => (window.location.href = "/")} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return <>{element}</>;
}

/*
Penggunaan:
<ProtectedRoute 
  element={<AdminDashboard />} 
  requiredRole="admin" 
/>
*/
