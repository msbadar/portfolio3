"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./ui/Icons";
import { useApp } from "@/context/AppContext";

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { dispatchUI } = useApp();

  const navLinks = [
    { id: "home", href: "/", icon: Icons.home, label: "Home" },
    { id: "search", href: "/search", icon: Icons.search, label: "Search" },
    { id: "blogs", href: "/blogs", icon: Icons.activity, label: "Blogs" },
    { id: "profile", href: "/profile", icon: Icons.profile, label: "Profile" },
  ];

  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-2xl bg-[var(--surface)] text-[var(--foreground)] shadow-lg"
      >
        {isOpen ? <Icons.close /> : <Icons.menu />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <nav
        className={`md:hidden fixed left-0 top-0 bottom-0 w-64 bg-[var(--surface)] z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <Link href="/" className="mb-8" onClick={() => setIsOpen(false)}>
            {Icons.logo()}
          </Link>

          <div className="flex flex-col gap-2 flex-1">
            {navLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  getIsActive(item.href)
                    ? "bg-[var(--accent)] text-[var(--background)]"
                    : "text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {item.icon(getIsActive(item.href))}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            <button
              onClick={() => {
                dispatchUI({ type: "TOGGLE_COMPOSE", payload: true });
                setIsOpen(false);
              }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all"
            >
              {Icons.create()}
              <span className="font-medium">Create</span>
            </button>
          </div>

          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all"
          >
            {Icons.menu()}
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </>
  );
};
