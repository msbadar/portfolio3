"use client";

import type { ReactNode } from "react";
import { ToastContainer } from "@/components/ui/Toast";
import { useApp } from "@/context/AppContext";

interface HomeLayoutContentProps {
  children: ReactNode;
}

const ToastContainerWithContext = () => {
  const { ui, dispatchUI } = useApp();
  return (
    <ToastContainer
      toasts={ui.toasts}
      onRemove={(id) => dispatchUI({ type: "REMOVE_TOAST", payload: id })}
    />
  );
};

export const HomeLayoutContent = ({ children }: HomeLayoutContentProps) => {
  return (
    <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
      {children}
      <ToastContainerWithContext />
    </div>
  );
};
