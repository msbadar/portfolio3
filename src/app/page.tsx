"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { MainContent } from "@/components/MainContent";
import { ToastContainer } from "@/components/ui/Toast";

// Global Styles
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  .animate-fadeIn { animation: fadeIn 0.4s ease; }
  .animate-scaleIn { animation: scaleIn 0.25s ease; }
  .animate-slideUp { animation: slideUp 0.3s ease; }
  .animate-spin { animation: spin 1s linear infinite; }
  .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
`;

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
      <div className="flex justify-between min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 font-sans text-slate-900">
        <style>{globalStyles}</style>
        <MainContent />
        <ToastContainerWithContext />
      </div>
    </AppProvider>
  );
}
