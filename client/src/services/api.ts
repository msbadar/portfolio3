import { apiClient } from "@/lib/api-client";
import type { Post, Blog, User, Suggestion, Comment } from "@/types";

// Generic API response types
interface ListResponse<T> {
  [key: string]: T[];
}

interface ItemResponse<T> {
  [key: string]: T;
}

// Specific response types (only when structure differs from generic)
interface PostResponse {
  post: Post;
}

interface BlogResponse {
  blog: Blog;
}

interface CommentsResponse {
  comments: Comment[];
}

interface CommentResponse {
  comment: Comment;
}

interface SuggestionsResponse {
  suggestions: Suggestion[];
}

interface LikeResponse {
  liked: boolean;
  likes: number;
}

interface FollowResponse {
  following: boolean;
}

// Generic CRUD operations
const createCrudApi = <T>(
  resource: string,
  resourceKey: string,
  listKey: string
) => ({
  async getAll(): Promise<T[]> {
    const data = await apiClient.get<ListResponse<T>>(`/${resource}`);
    return data[listKey];
  },

  async getById(id: number): Promise<T> {
    const data = await apiClient.get<ItemResponse<T>>(`/${resource}/${id}`);
    return data[resourceKey];
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/${resource}/${id}`);
  },

  async like(id: number): Promise<LikeResponse> {
    return apiClient.post<LikeResponse>(`/${resource}/${id}/like`);
  },
});

const api = {
  // Posts API
  posts: {
    ...createCrudApi<Post>("posts", "post", "posts"),

    // Override getAll to support filters
    async getAll(filters?: {
      type?: 'post' | 'blog' | 'comment';
      category?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }): Promise<Post[]> {
      const data = await apiClient.get<ListResponse<Post>>("/posts", filters);
      return data.posts;
    },

    async create(post: { content: string; image?: string }): Promise<Post> {
      const data = await apiClient.post<PostResponse>("/posts", {
        content: post.content,
        image: post.image,
      });
      return data.post;
    },

    // Comments API (comments are stored as posts with type='comment')
    async getComments(postId: number): Promise<Comment[]> {
      const data = await apiClient.get<CommentsResponse>(
        `/posts/${postId}/comments`
      );
      return data.comments;
    },

    async createComment(comment: {
      parentId: number;
      content: string;
    }): Promise<Comment> {
      const data = await apiClient.post<CommentResponse>("/posts/comments", {
        parentId: comment.parentId,
        content: comment.content,
      });
      return data.comment;
    },
  },

  // Blogs API (blogs are stored as posts with type='blog')
  blogs: {
    ...createCrudApi<Blog>("blogs", "blog", "blogs"),

    async create(blog: {
      title: string;
      content: string;
      excerpt: string;
      coverImage?: string;
      category: string;
      readTime: string;
    }): Promise<Blog> {
      const data = await apiClient.post<BlogResponse>("/blogs", blog);
      return data.blog;
    },

    async update(
      blogId: number,
      blog: {
        title?: string;
        content?: string;
        excerpt?: string;
        coverImage?: string;
        category?: string;
        readTime?: string;
      }
    ): Promise<Blog> {
      const data = await apiClient.put<BlogResponse>(`/blogs/${blogId}`, blog);
      return data.blog;
    },
  },

  // Users API
  users: {
    async getSuggestions(): Promise<Suggestion[]> {
      const data = await apiClient.get<SuggestionsResponse>(
        "/user/suggestions"
      );
      return data.suggestions;
    },
    async follow(userId: number): Promise<FollowResponse> {
      return apiClient.post<FollowResponse>(`/user/${userId}/follow`);
    },
    async getCurrentUser(): Promise<User> {
      const data = await apiClient.get<{ success: boolean; user: User }>(
        "/auth/me"
      );
      return data.user;
    },
    async updateProfile(userData: Partial<User>): Promise<User> {
      const data = await apiClient.put<{ user: User }>("/user/me", userData);
      return data.user;
    },
  },
};

export default api;
