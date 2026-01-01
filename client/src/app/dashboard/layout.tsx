"use client";

import type { ReactNode } from "react";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastContainer } from "@/components/ui/Toast";
import { useApp } from "@/context/AppContext";

interface DashboardLayoutProps {
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

const DashboardLayoutContent = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
      <ToastContainerWithContext />
    </div>
  );
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AppProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AppProvider>
  );
}
