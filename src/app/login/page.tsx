import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login - Threadz",
  description: "Sign in to your Threadz account to connect with others and share your thoughts.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <LoginForm />
    </div>
  );
}
