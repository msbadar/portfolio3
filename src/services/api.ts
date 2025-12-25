import {
  initialPostsData,
  initialBlogsData,
  suggestionsData,
  currentUserData,
} from "@/data/mockData";
import type { Post, Blog, User, Suggestion } from "@/types";

const API_DELAY = 800; // Simulate network delay

interface RequestOptions<T> {
  data?: T;
  canFail?: boolean;
}

const api = {
  // Simulate API calls with delays
  async request<T>(endpoint: string, options: RequestOptions<T> = {}): Promise<T | undefined> {
    await new Promise((resolve) => setTimeout(resolve, API_DELAY));

    // Simulate random failures (10% chance)
    if (Math.random() < 0.1 && options.canFail) {
      throw new Error("Network error. Please try again.");
    }

    return options.data;
  },

  // Posts API
  posts: {
    async getAll(): Promise<Post[]> {
      const data = await api.request("/posts", { data: initialPostsData });
      return data as Post[];
    },
    async create(post: { content: string; user: User | null }): Promise<Post> {
      const newPost: Post = {
        id: Date.now(),
        user: {
          name: post.user?.name || "Anonymous",
          username: post.user?.username || "anonymous",
          avatar: post.user?.avatar || "",
          verified: post.user?.verified || false,
        },
        content: post.content,
        time: "now",
        likes: 0,
        comments: 0,
        reposts: 0,
        liked: false,
      };
      return api.request("/posts", { data: newPost }) as Promise<Post>;
    },
    async like(postId: number, liked: boolean): Promise<{ postId: number; liked: boolean }> {
      return api.request(`/posts/${postId}/like`, { data: { postId, liked } }) as Promise<{ postId: number; liked: boolean }>;
    },
    async delete(postId: number): Promise<{ postId: number }> {
      return api.request(`/posts/${postId}`, { data: { postId } }) as Promise<{ postId: number }>;
    },
  },

  // Blogs API
  blogs: {
    async getAll(): Promise<Blog[]> {
      return api.request("/blogs", { data: initialBlogsData }) as Promise<Blog[]>;
    },
    async getById(id: number): Promise<Blog | undefined> {
      const blog = initialBlogsData.find((b) => b.id === id);
      return api.request(`/blogs/${id}`, { data: blog }) as Promise<Blog | undefined>;
    },
    async like(blogId: number, liked: boolean): Promise<{ blogId: number; liked: boolean }> {
      return api.request(`/blogs/${blogId}/like`, { data: { blogId, liked } }) as Promise<{ blogId: number; liked: boolean }>;
    },
  },

  // Users API
  users: {
    async getSuggestions(): Promise<Suggestion[]> {
      return api.request("/users/suggestions", { data: suggestionsData }) as Promise<Suggestion[]>;
    },
    async follow(userId: number, following: boolean): Promise<{ userId: number; following: boolean }> {
      return api.request(`/users/${userId}/follow`, {
        data: { userId, following },
      }) as Promise<{ userId: number; following: boolean }>;
    },
    async getCurrentUser(): Promise<User> {
      return api.request("/users/me", { data: currentUserData }) as Promise<User>;
    },
    async updateProfile(data: Partial<User>): Promise<User> {
      return api.request("/users/me", {
        data: { ...currentUserData, ...data },
      }) as Promise<User>;
    },
  },
};

export default api;
