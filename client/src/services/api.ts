import { apiClient } from "@/lib/api-client";
import type { Post, Blog, User, Suggestion, Comment } from "@/types";

interface PostsResponse {
  posts: Post[];
}

interface PostResponse {
  post: Post;
}

interface BlogsResponse {
  blogs: Blog[];
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

const api = {
  // Posts API
  posts: {
    async getAll(): Promise<Post[]> {
      const data = await apiClient.get<PostsResponse>("/posts");
      return data.posts;
    },
    async create(post: { content: string; image?: string }): Promise<Post> {
      const data = await apiClient.post<PostResponse>("/posts", {
        content: post.content,
        image: post.image,
      });
      return data.post;
    },
    async like(postId: number): Promise<LikeResponse> {
      return apiClient.post<LikeResponse>(`/posts/${postId}/like`);
    },
    async delete(postId: number): Promise<void> {
      await apiClient.delete(`/posts/${postId}`);
    },
    // Comments API (comments are stored as posts with type='comment')
    async getComments(postId: number): Promise<Comment[]> {
      const data = await apiClient.get<CommentsResponse>(`/posts/${postId}/comments`);
      return data.comments;
    },
    async createComment(comment: { parentId: number; content: string }): Promise<Comment> {
      const data = await apiClient.post<CommentResponse>("/posts/comments", {
        parentId: comment.parentId,
        content: comment.content,
      });
      return data.comment;
    },
  },

  // Blogs API (blogs are stored as posts with type='blog')
  blogs: {
    async getAll(): Promise<Blog[]> {
      const data = await apiClient.get<BlogsResponse>("/blogs");
      return data.blogs;
    },
    async getById(id: number): Promise<Blog> {
      const data = await apiClient.get<BlogResponse>(`/blogs/${id}`);
      return data.blog;
    },
    async like(blogId: number): Promise<LikeResponse> {
      return apiClient.post<LikeResponse>(`/blogs/${blogId}/like`);
    },
  },

  // Users API
  users: {
    async getSuggestions(): Promise<Suggestion[]> {
      const data = await apiClient.get<SuggestionsResponse>("/users/suggestions");
      return data.suggestions;
    },
    async follow(userId: number): Promise<FollowResponse> {
      return apiClient.post<FollowResponse>(`/users/${userId}/follow`);
    },
    async getCurrentUser(): Promise<User> {
      const data = await apiClient.get<{ success: boolean; user: User }>("/auth/me");
      return data.user;
    },
    async updateProfile(userData: Partial<User>): Promise<User> {
      const data = await apiClient.put<{ user: User }>("/users/me", userData);
      return data.user;
    },
  },
};

export default api;
