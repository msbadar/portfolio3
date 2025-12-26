"use client";

import { useApp } from "@/context/AppContext";
import { AvatarMenu } from "@/components/AvatarMenu";
import { MainContent } from "@/components/MainContent";
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

// Main App Content
export const AppContent = () => {
  return (
    <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
      <AvatarMenu />
      <div className="flex-1 max-w-5xl mx-auto w-full">
        <MainContent />
      </div>
      <ComposeModal />
      <ToastContainerWithContext />
    </div>
  );
};
