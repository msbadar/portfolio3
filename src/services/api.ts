import {
  initialPostsData,
  initialBlogsData,
  suggestionsData,
  currentUserData,
} from "@/data/mockData";
import { Blog, Post, User } from "@/types/app";

const API_DELAY = 800; // Simulate network delay

interface RequestOptions<T> {
  data?: T;
  canFail?: boolean;
}

const api = {
  // Simulate API calls with delays
  async request<T>(endpoint: string, options: RequestOptions<T> = {}) {
    await new Promise((resolve) => setTimeout(resolve, API_DELAY));

    // Simulate random failures (10% chance)
    if (Math.random() < 0.1 && options.canFail) {
      throw new Error("Network error. Please try again.");
    }

    return options.data as T;
  },

  // Posts API
  posts: {
    async getAll(): Promise<Post[]> {
      const data = await api.request("/posts", { data: initialPostsData });
      return data;
    },
    async create(post: { content: string; user: User }): Promise<Post> {
      const newPost = {
        ...post,
        id: Date.now(),
        time: "now",
        likes: 0,
        comments: 0,
        reposts: 0,
        liked: false,
      };
      return api.request("/posts", { data: newPost });
    },
    async like(
      postId: number,
      liked: boolean
    ): Promise<{ postId: number; liked: boolean }> {
      return api.request(`/posts/${postId}/like`, { data: { postId, liked } });
    },
    async delete(postId: number): Promise<{ postId: number }> {
      return api.request(`/posts/${postId}`, { data: { postId } });
    },
  },

  // Blogs API
  blogs: {
    async getAll(): Promise<Blog[]> {
      return api.request("/blogs", { data: initialBlogsData });
    },
    async getById(id: number): Promise<Blog | undefined> {
      const blog = initialBlogsData.find((b) => b.id === id);
      return api.request(`/blogs/${id}`, { data: blog });
    },
    async like(
      blogId: number,
      liked: boolean
    ): Promise<{ blogId: number; liked: boolean }> {
      return api.request(`/blogs/${blogId}/like`, { data: { blogId, liked } });
    },
  },

  // Users API
  users: {
    async getSuggestions(): Promise<User[]> {
      return api.request("/users/suggestions", { data: suggestionsData });
    },
    async follow(
      userId: number,
      following: boolean
    ): Promise<{ userId: number; following: boolean }> {
      return api.request(`/users/${userId}/follow`, {
        data: { userId, following },
      });
    },
    async getCurrentUser(): Promise<User> {
      return api.request("/users/me", { data: currentUserData });
    },
    async updateProfile(data: Partial<User>): Promise<User> {
      return api.request("/users/me", {
        data: { ...currentUserData, ...data },
      });
    },
  },
};

export default api;
