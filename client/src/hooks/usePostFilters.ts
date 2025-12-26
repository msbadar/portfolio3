"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface PostFilters {
  type?: 'post' | 'blog';
  category?: string;
  search?: string;
}

export const usePostFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current filters from URL
  const filters = useMemo<PostFilters>(() => ({
    type: (searchParams.get('type') as 'post' | 'blog') || undefined,
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
  }), [searchParams]);

  // Update URL with new filters
  const setFilters = useCallback((newFilters: Partial<PostFilters>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update or remove each filter
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Update URL without page reload
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    filters,
    setFilters,
    clearFilters,
    hasFilters: Object.values(filters).some(v => v !== undefined),
  };
};
