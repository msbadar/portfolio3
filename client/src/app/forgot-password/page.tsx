import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password - Threadz",
  description: "Reset your Threadz account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <ForgotPasswordForm />
    </div>
  );
}
