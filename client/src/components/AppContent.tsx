"use client";

import type { ReactNode } from "react";
import { useApp } from "@/context/AppContext";
import { AvatarMenu } from "@/components/AvatarMenu";
import { ComposeModal } from "@/components/ComposeModal";
import { ToastContainer } from "@/components/ui/Toast";

// Toast Container with Context
const ToastContainerWithContext = () => {
  const { ui, dispatchUI } = useApp();
  return (
    <ToastContainer
      toasts={ui.toasts}
      onRemove={(id) => dispatchUI({ type: "REMOVE_TOAST", payload: id })}
    />
  );
};

interface AppContentProps {
  children: ReactNode;
}

// Main App Content
export const AppContent = ({ children }: AppContentProps) => {
  return (
    <div className="flex h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
      <AvatarMenu />
      <div className="flex-1 max-w-5xl mx-auto w-full">{children}</div>
      <ComposeModal />
      <ToastContainerWithContext />
    </div>
  );
};
