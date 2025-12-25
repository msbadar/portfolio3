import React from "react";
import { Icons } from "./Icons";
import type { Toast as ToastType } from "@/types";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  const bgColor =
    type === "success"
      ? "bg-emerald-500"
      : type === "error"
      ? "bg-rose-500"
      : "bg-slate-700";
  const icon =
    type === "success"
      ? Icons.check()
      : type === "error"
      ? Icons.error()
      : null;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${bgColor} text-white rounded-xl shadow-lg animate-slideUp`}
    >
      {icon && <span>{icon}</span>}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        {Icons.close()}
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: number) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};
