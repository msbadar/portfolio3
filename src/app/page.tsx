"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { MainContent } from "@/components/MainContent";
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

// Root App with Provider
export default function App() {
  return (
    <AppProvider>
      <div className="flex justify-between min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30 font-sans text-slate-900">
        <MainContent />
        <ToastContainerWithContext />
      </div>
    </AppProvider>
  );
}
