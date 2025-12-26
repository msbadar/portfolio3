import type { Post, Blog, User } from "@/types";

// Server-side API configuration
const getServerApiUrl = (): string => {
  // In server components, we can use internal container names or localhost
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (apiUrl) {
    return apiUrl;
  }
  // Development fallback
  return "http://localhost:3001/api";
};

const API_URL = getServerApiUrl();

// Generic API response types
interface ListResponse<T> {
  [key: string]: T[];
}

// Helper function to build query strings
const buildQueryString = (params?: Record<string, unknown>): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Server-side fetch utility
async function serverFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Include site header if configured
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;
  if (siteName) {
    headers["X-Site"] = siteName;
  }

  // Merge with any additional headers from options
  if (options?.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (value) headers[key] = String(value);
    });
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Disable caching for SSR to get fresh data
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || error.error || "Request failed");
    }

    return response.json();
  } catch (error) {
    console.error(`Server API error for ${endpoint}:`, error);
    throw error;
  }
}

// Server-side API client
export const serverApi = {
  posts: {
    async getAll(filters?: {
      type?: 'post' | 'blog' | 'comment';
      category?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }): Promise<Post[]> {
      try {
        const queryString = buildQueryString(filters);
        const data = await serverFetch<ListResponse<Post>>(`/posts${queryString}`);
        return data.posts || [];
      } catch (error) {
        console.error("Failed to fetch posts on server:", error);
        return [];
      }
    },
  },

  blogs: {
    async getAll(): Promise<Blog[]> {
      try {
        const data = await serverFetch<ListResponse<Blog>>("/blogs");
        return data.blogs || [];
      } catch (error) {
        console.error("Failed to fetch blogs on server:", error);
        return [];
      }
    },
  },

  users: {
    async getCurrent(): Promise<User | null> {
      try {
        const data = await serverFetch<{ success: boolean; user: User }>(
          "/auth/me"
        );
        return data.user;
      } catch (error) {
        console.error("Failed to fetch current user on server:", error);
        return null;
      }
    },
  },
};
