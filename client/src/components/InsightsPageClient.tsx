"use client";

import React from "react";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
import { AppProvider, useApp } from "@/context/AppContext";
import { AvatarMenu } from "@/components/AvatarMenu";
import { ToastContainer } from "@/components/ui/Toast";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, positive, icon }: StatCardProps) => (
  <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-card">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center text-[var(--accent)]">
        {icon}
      </div>
      <span className={`text-sm font-medium px-2 py-1 rounded-lg ${positive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
        {positive ? "+" : ""}{change}
      </span>
    </div>
    <h3 className="text-3xl font-bold text-[var(--foreground)] mb-1">{value}</h3>
    <p className="text-sm text-[var(--muted)]">{title}</p>
  </div>
);

interface BarChartProps {
  data: { label: string; value: number }[];
  maxValue: number;
}

const BarChart = ({ data, maxValue }: BarChartProps) => (
  <div className="space-y-3">
    {data.map((item) => (
      <div key={item.label} className="flex items-center gap-3">
        <span className="text-sm text-[var(--muted)] w-10">{item.label}</span>
        <div className="flex-1 h-8 bg-[var(--background)] rounded-lg overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dim)] rounded-lg transition-all duration-500"
            style={{ width: `${(item.value / maxValue) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-[var(--foreground)] w-12 text-right">{item.value}</span>
      </div>
    ))}
  </div>
);

interface LineChartProps {
  data: number[];
  labels: string[];
}

const LineChart = ({ data, labels }: LineChartProps) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--border)" strokeWidth="0.5" />
        ))}
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((value - minValue) / range) * 80 - 10;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="var(--accent)"
              className="hover:r-3 transition-all"
            />
          );
        })}
      </svg>
      <div className="flex justify-between mt-2">
        {labels.map((label) => (
          <span key={label} className="text-xs text-[var(--muted)]">{label}</span>
        ))}
      </div>
    </div>
  );
};

const InsightsContent = () => {
  // Mock data for demonstration
  const stats = {
    followers: "2,847",
    followersChange: "12%",
    posts: "142",
    postsChange: "8%",
    likes: "12.4K",
    likesChange: "-2%",
    impressions: "58.3K",
    impressionsChange: "24%",
  };

  const weeklyData = [
    { label: "Mon", value: 120 },
    { label: "Tue", value: 95 },
    { label: "Wed", value: 180 },
    { label: "Thu", value: 145 },
    { label: "Fri", value: 210 },
    { label: "Sat", value: 85 },
    { label: "Sun", value: 160 },
  ];

  const monthlyViews = [450, 520, 380, 620, 710, 580, 890, 720, 850, 920, 780, 1050];
  const monthLabels = ["Jan", "Mar", "May", "Jul", "Sep", "Nov"];

  const topPosts = [
    { id: 1, title: "Introduction to React Hooks", views: 2340, likes: 156 },
    { id: 2, title: "Building Modern Web Apps", views: 1890, likes: 98 },
    { id: 3, title: "TypeScript Best Practices", views: 1560, likes: 87 },
    { id: 4, title: "CSS Grid Mastery", views: 1230, likes: 72 },
    { id: 5, title: "Node.js Performance Tips", views: 980, likes: 54 },
  ];

  const engagementRate = 4.2;

  return (
    <>
      <AvatarMenu />
      <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/settings"
              className="p-2 rounded-xl text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] transition-all"
            >
              {Icons.back()}
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Insights</h1>
              <p className="text-sm text-[var(--muted)]">Your account performance and analytics</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Followers"
              value={stats.followers}
              change={stats.followersChange}
              positive={true}
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            />
            <StatCard
              title="Total Posts"
              value={stats.posts}
              change={stats.postsChange}
              positive={true}
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
            />
            <StatCard
              title="Total Likes"
              value={stats.likes}
              change={stats.likesChange}
              positive={false}
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
            />
            <StatCard
              title="Impressions"
              value={stats.impressions}
              change={stats.impressionsChange}
              positive={true}
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Engagement */}
            <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Weekly Engagement</h2>
              <BarChart data={weeklyData} maxValue={Math.max(...weeklyData.map(d => d.value))} />
            </div>

            {/* Monthly Views */}
            <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Monthly Profile Views</h2>
              <LineChart data={monthlyViews} labels={monthLabels} />
            </div>
          </div>

          {/* Engagement Rate */}
          <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-card mb-8">
            <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Engagement Rate</h2>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${engagementRate * 25.13} 251.3`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--foreground)]">{engagementRate}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[var(--muted)] mb-2">
                  Your engagement rate is <span className="text-green-500 font-medium">above average</span> compared to similar accounts.
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Engagement rate is calculated based on likes, comments, and reposts relative to your follower count.
                </p>
              </div>
            </div>
          </div>

          {/* Top Performing Posts */}
          <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Top Performing Posts</h2>
            <div className="space-y-3">
              {topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <span className="w-8 h-8 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center text-[var(--accent)] font-semibold text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)] truncate">{post.title}</p>
                    <div className="flex gap-4 text-sm text-[var(--muted)]">
                      <span>{post.views.toLocaleString()} views</span>
                      <span>{post.likes} likes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const ToastContainerWithContext = () => {
  const { ui, dispatchUI } = useApp();
  return (
    <ToastContainer
      toasts={ui.toasts}
      onRemove={(id) => dispatchUI({ type: "REMOVE_TOAST", payload: id })}
    />
  );
};

export const InsightsPageClient = () => {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
        <InsightsContent />
        <ToastContainerWithContext />
      </div>
    </AppProvider>
  );
};
