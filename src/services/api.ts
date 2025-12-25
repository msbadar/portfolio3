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
      return data ?? [];
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
      const result = await api.request("/posts", { data: newPost });
      return result ?? newPost;
    },
    async like(postId: number, liked: boolean): Promise<{ postId: number; liked: boolean }> {
      const result = await api.request(`/posts/${postId}/like`, { data: { postId, liked } });
      return result ?? { postId, liked };
    },
    async delete(postId: number): Promise<{ postId: number }> {
      const result = await api.request(`/posts/${postId}`, { data: { postId } });
      return result ?? { postId };
    },
  },

  // Blogs API
  blogs: {
    async getAll(): Promise<Blog[]> {
      const data = await api.request("/blogs", { data: initialBlogsData });
      return data ?? [];
    },
    async getById(id: number): Promise<Blog | undefined> {
      const blog = initialBlogsData.find((b) => b.id === id);
      return api.request(`/blogs/${id}`, { data: blog });
    },
    async like(blogId: number, liked: boolean): Promise<{ blogId: number; liked: boolean }> {
      const result = await api.request(`/blogs/${blogId}/like`, { data: { blogId, liked } });
      return result ?? { blogId, liked };
    },
  },

  // Users API
  users: {
    async getSuggestions(): Promise<Suggestion[]> {
      const data = await api.request("/users/suggestions", { data: suggestionsData });
      return data ?? [];
    },
    async follow(userId: number, following: boolean): Promise<{ userId: number; following: boolean }> {
      const result = await api.request(`/users/${userId}/follow`, {
        data: { userId, following },
      });
      return result ?? { userId, following };
    },
    async getCurrentUser(): Promise<User> {
      const data = await api.request("/users/me", { data: currentUserData });
      return data ?? currentUserData;
    },
    async updateProfile(data: Partial<User>): Promise<User> {
      const result = await api.request("/users/me", {
        data: { ...currentUserData, ...data },
      });
      return result ?? { ...currentUserData, ...data };
    },
  },
};

export default api;
