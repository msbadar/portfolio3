"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "../ui/Icons";
import { useApp } from "@/context/AppContext";

interface NavLinkProps {
  href: string;
  icon: (active: boolean) => React.ReactNode;
  isActive: boolean;
}

const NavLink = ({ href, icon, isActive }: NavLinkProps) => (
  <Link
    href={href}
    className={`group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
    }`}
  >
    {icon(isActive)}
    {isActive && (
      <span className="absolute -right-1 w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
    )}
  </Link>
);

interface NavButtonProps {
  icon: (active: boolean) => React.ReactNode;
  onClick: () => void;
}

const NavButton = ({ icon, onClick }: NavButtonProps) => (
  <button
    onClick={onClick}
    className="group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
  >
    {icon(false)}
  </button>
);

export const Sidebar = () => {
  const pathname = usePathname();
  const { dispatchUI } = useApp();

  const navLinks = [
    { id: "home", href: "/", icon: Icons.home },
    { id: "search", href: "/search", icon: Icons.search },
    { id: "blogs", href: "/blogs", icon: Icons.activity },
    { id: "profile", href: "/profile", icon: Icons.profile },
  ];

  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="w-20 flex flex-col items-center py-6 fixed left-0 top-0 bottom-0 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 z-50">
      <Link href="/" className="mb-8">
        {Icons.logo()}
      </Link>
      <div className="flex flex-col gap-2 flex-1">
        {navLinks.slice(0, 2).map((item) => (
          <NavLink
            key={item.id}
            href={item.href}
            icon={item.icon}
            isActive={getIsActive(item.href)}
          />
        ))}
        <NavButton
          icon={Icons.create}
          onClick={() => dispatchUI({ type: "TOGGLE_COMPOSE", payload: true })}
        />
        {navLinks.slice(2).map((item) => (
          <NavLink
            key={item.id}
            href={item.href}
            icon={item.icon}
            isActive={getIsActive(item.href)}
          />
        ))}
      </div>
      <Link
        href="/login"
        className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 transition-all"
      >
        {Icons.menu()}
      </Link>
    </nav>
  );
};
