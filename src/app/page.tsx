"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/MainContent";
import { RightSidebar } from "@/components/RightSidebar";
import { BlogDetailView } from "@/components/BlogDetailView";
import { ComposeModal } from "@/components/ComposeModal";
import { MobileMenu } from "@/components/MobileMenu";
import { ToastContainer } from "@/components/ui/Toast";
import { useBlogs } from "@/hooks/useBlogs";

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
const AppContent = () => {
  const { blogs } = useBlogs();

  return (
    <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
      <MobileMenu />
      <Sidebar />
      {blogs.selected ? <BlogDetailView /> : <MainContent />}
      <RightSidebar />
      <ComposeModal />
      <ToastContainerWithContext />
    </div>
  );
};

// Root App with Provider
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
