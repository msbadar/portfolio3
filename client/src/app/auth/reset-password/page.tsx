import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password - Threadz",
  description: "Create a new password for your Threadz account.",
};

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-[var(--muted)]">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
