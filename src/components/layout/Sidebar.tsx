import React from "react";
import { Icons } from "../ui/Icons";
import { useApp } from "@/context/AppContext";

interface NavButtonProps {
  id: string;
  icon: (active: boolean) => React.ReactNode;
  onClick: () => void;
  activeTab: string;
}

const NavButton = ({ id, icon, onClick, activeTab }: NavButtonProps) => (
  <button
    onClick={onClick}
    className={`group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
      activeTab === id
        ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
    }`}
  >
    {icon(activeTab === id)}
    {activeTab === id && (
      <span className="absolute -right-1 w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
    )}
  </button>
);

export const Sidebar = () => {
  const { ui, dispatchUI } = useApp();

  const navItems = [
    { id: "home", icon: Icons.home },
    { id: "search", icon: Icons.search },
    {
      id: "create",
      icon: Icons.create,
      onClick: () => dispatchUI({ type: "TOGGLE_COMPOSE", payload: true }),
    },
    { id: "activity", icon: Icons.activity },
    { id: "profile", icon: Icons.profile },
  ];

  return (
    <nav className="w-20 flex flex-col items-center py-6 fixed left-0 top-0 bottom-0 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 z-50">
      <div className="mb-8">{Icons.logo()}</div>
      <div className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            id={item.id}
            icon={item.icon}
            activeTab={ui.activeTab}
            onClick={
              item.onClick ||
              (() => dispatchUI({ type: "SET_ACTIVE_TAB", payload: item.id }))
            }
          />
        ))}
      </div>
      <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 transition-all">
        {Icons.menu()}
      </button>
    </nav>
  );
};
