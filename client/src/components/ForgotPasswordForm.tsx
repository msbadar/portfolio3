"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/ui/Icons";

export const ForgotPasswordForm = () => {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await forgotPassword({ email });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || "An error occurred");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md p-8 bg-[var(--surface)] rounded-3xl shadow-xl shadow-black/30 border border-[var(--border)]">
        <div className="flex flex-col items-center mb-8">
          {Icons.logo()}
          <h1 className="text-2xl font-bold mt-4 text-[var(--accent)]">
            Check Your Email
          </h1>
          <p className="text-[var(--muted)] mt-2 text-center">
            If an account exists with this email, we&apos;ve sent you a password reset link.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-[var(--accent)] hover:underline text-sm"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-[var(--surface)] rounded-3xl shadow-xl shadow-black/30 border border-[var(--border)]">
      <div className="flex flex-col items-center mb-8">
        {Icons.logo()}
        <h1 className="text-2xl font-bold mt-4 text-[var(--accent)]">
          Forgot Password
        </h1>
        <p className="text-[var(--muted)] mt-2 text-center">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--muted)] mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[var(--accent)] text-[var(--background)] rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-[var(--accent)] hover:underline text-sm"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};
