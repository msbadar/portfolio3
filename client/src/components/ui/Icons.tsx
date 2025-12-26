import React from "react";
import {
  Home,
  Search,
  SquarePlus,
  Heart,
  User,
  MessageCircle,
  Repeat2,
  Share,
  BadgeCheck,
  MoreHorizontal,
  Menu,
  ArrowLeft,
  Clock,
  Bookmark,
  Link2,
  Sparkles,
  Image as ImageIcon,
  X,
  Check,
  XCircle,
  Loader2,
  Settings,
  BarChart2,
} from "lucide-react";

export const Icons = {
  home: (active: boolean) => (
    <Home
      size={24}
      fill={active ? "currentColor" : "none"}
      strokeWidth={2}
    />
  ),
  search: () => <Search size={24} strokeWidth={2} />,
  create: () => <SquarePlus size={24} strokeWidth={2} />,
  activity: (active: boolean) => (
    <Heart
      size={24}
      fill={active ? "currentColor" : "none"}
      strokeWidth={2}
    />
  ),
  profile: () => <User size={24} strokeWidth={2} />,
  heart: (filled: boolean) => (
    <Heart
      size={20}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    />
  ),
  comment: () => <MessageCircle size={20} strokeWidth={2} />,
  repost: () => <Repeat2 size={20} strokeWidth={2} />,
  share: () => <Share size={20} strokeWidth={2} />,
  verified: () => (
    <BadgeCheck
      size={16}
      className="text-[var(--accent)]"
      fill="currentColor"
      stroke="var(--background)"
    />
  ),
  more: () => <MoreHorizontal size={20} />,
  logo: () => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="url(#logoGradient)" />
      <path
        d="M24 14v20M14 24h20"
        stroke="var(--background)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="var(--foreground)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
    </svg>
  ),
  menu: () => <Menu size={24} strokeWidth={2} />,
  back: () => <ArrowLeft size={24} strokeWidth={2} />,
  clock: () => <Clock size={14} strokeWidth={2} />,
  bookmark: (filled: boolean) => (
    <Bookmark
      size={20}
      fill={filled ? "currentColor" : "none"}
      strokeWidth={2}
    />
  ),
  link: () => <Link2 size={16} strokeWidth={2} />,
  sparkle: () => <Sparkles size={16} strokeWidth={2} />,
  image: () => <ImageIcon size={20} strokeWidth={2} />,
  close: () => <X size={20} strokeWidth={2} />,
  check: () => <Check size={16} strokeWidth={3} />,
  error: () => <XCircle size={16} strokeWidth={2} />,
  loader: () => <Loader2 size={20} strokeWidth={2} className="animate-spin" />,
  settings: (active?: boolean) => (
    <Settings
      size={24}
      fill={active ? "currentColor" : "none"}
      strokeWidth={2}
    />
  ),
  insights: () => <BarChart2 size={24} strokeWidth={2} />,
};
