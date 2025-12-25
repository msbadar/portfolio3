"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/ui/Icons";

export const LoginForm = () => {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = isRegister
        ? await register(formData)
        : await login({ email: formData.email, password: formData.password });

      if (response.success) {
        router.push("/");
      } else {
        setError(response.error || "An error occurred");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-md p-8 bg-[var(--surface)] rounded-3xl shadow-xl shadow-black/30 border border-[var(--border)]">
      <div className="flex flex-col items-center mb-8">
        {Icons.logo()}
        <h1 className="text-2xl font-bold mt-4 text-[var(--accent)]">
          {isRegister ? "Join Threadz" : "Welcome to Threadz"}
        </h1>
        <p className="text-[var(--muted)] mt-2 text-center">
          {isRegister
            ? "Create an account to connect with others"
            : "Sign in to connect with others and share your thoughts"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--muted)] mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={isRegister}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--muted)] mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required={isRegister}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="johndoe"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--muted)] mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--muted)] mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[var(--accent)] text-[var(--background)] rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : isRegister ? "Create Account" : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError(null);
          }}
          className="text-[var(--accent)] hover:underline text-sm"
        >
          {isRegister
            ? "Already have an account? Sign in"
            : "Don't have an account? Create one"}
        </button>
      </div>

      <div className="mt-8 text-center text-xs text-[var(--muted)]">
        <p>
          By signing in, you agree to our{" "}
          <a href="/terms" className="text-[var(--accent)] hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-[var(--accent)] hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};
