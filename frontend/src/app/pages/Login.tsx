import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";

type LoginMode = "admin" | "staff";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeMode, setActiveMode] = useState<LoginMode>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent, mode: LoginMode) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("Email dan password wajib diisi.");
        setIsLoading(false);
        return;
      }

      const loggedInUser = await login(email, password);

      if (mode !== loggedInUser.role) {
        setError(`Akun ini terdaftar sebagai ${loggedInUser.role}. Silakan gunakan form login ${loggedInUser.role}.`);
        setActiveMode(loggedInUser.role);
        setIsLoading(false);
        return;
      }

      navigate(loggedInUser.role === "staff" ? "/staff" : "/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login gagal. Silakan cek email dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{
        backgroundImage: "linear-gradient(rgba(10, 42, 56, 0.45), rgba(10, 42, 56, 0.45)), url('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-2xl backdrop-blur-sm">
        <div className="relative overflow-hidden">
          <div className="grid min-h-[560px] md:grid-cols-2">
            <div
              className="relative p-8 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:p-10 lg:p-12"
              style={{
                transform: activeMode === "admin" ? "translateX(0%)" : "translateX(100%)",
                zIndex: 10,
              }}
            >
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F6B7A] text-lg font-bold text-white">B</div>
                <div>
                  <p className="text-base font-semibold text-[#1F6B7A]">Bespoke Travel</p>
                  <p className="text-xs text-slate-500">Jemaah Management System</p>
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#124a55]">{activeMode === "admin" ? "Admin Login" : "Staff Login"}</h1>
              <p className="mt-2 text-sm text-slate-500">{activeMode === "admin" ? "Access the administrative dashboard" : "Access the staff follow-up dashboard"}</p>

              <form onSubmit={(e) => handleSubmit(e, activeMode)} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeMode === "admin" ? "admin@bespoketravel.com" : "staff@bespoketravel.com"}
                    autoComplete="email"
                    disabled={isLoading}
                    className="border-slate-200 bg-slate-50/70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="border-slate-200 bg-slate-50/70"
                  />
                </div>
                {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
                <Button type="submit" className="mt-2 w-full bg-[#1F6B7A] font-semibold text-white hover:bg-[#185866]" disabled={isLoading}>
                  {isLoading ? "Logging in..." : activeMode === "admin" ? "Log In as Admin" : "Log In as Staff"}
                </Button>
              </form>
            </div>

            <div className="relative hidden md:block">
              <div
                className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#1F6B7A] px-10 text-center text-white transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: activeMode === "admin" ? "translateX(0%)" : "translateX(-100%)",
                  zIndex: 20,
                }}
              >
                <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full border border-white/20" />
                <div className="absolute -bottom-16 -right-16 h-52 w-52 rounded-full border border-white/20" />
                <h2 className="relative text-3xl font-semibold">{activeMode === "admin" ? "Are you staff?" : "Admin access?"}</h2>
                <p className="relative mt-3 max-w-xs text-sm text-white/80">
                  {activeMode === "admin" ? "If you are a travel consultant or agent, use the staff portal to manage client follow-ups." : "Return to the admin portal for user management, reporting, and operational settings."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="relative mt-8 rounded-full border-white bg-transparent px-8 text-white hover:bg-white/15"
                  onClick={() => {
                    setError("");
                    setActiveMode(activeMode === "admin" ? "staff" : "admin");
                  }}
                  disabled={isLoading}
                >
                  {activeMode === "admin" ? "Login as Staff" : "Login as Admin"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 border-t bg-white px-4 py-3 md:hidden">
          <Button
            type="button"
            variant={activeMode === "admin" ? "default" : "outline"}
            className={activeMode === "admin" ? "bg-[#1F6B7A] text-white hover:bg-[#185866]" : "border-[#1F6B7A] text-[#1F6B7A]"}
            onClick={() => {
              setError("");
              setActiveMode("admin");
            }}
            disabled={isLoading}
          >
            Admin
          </Button>
          <Button
            type="button"
            variant={activeMode === "staff" ? "default" : "outline"}
            className={activeMode === "staff" ? "bg-[#1F6B7A] text-white hover:bg-[#185866]" : "border-[#1F6B7A] text-[#1F6B7A]"}
            onClick={() => {
              setError("");
              setActiveMode("staff");
            }}
            disabled={isLoading}
          >
            Staff
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
