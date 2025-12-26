import { useCallback } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

export const usePosts = () => {
  const { posts, dispatchPosts, showToast } = useApp();

  const fetchPosts = useCallback(async (filters?: {
    type?: 'post' | 'blog';
    category?: string;
    search?: string;
  }) => {
    dispatchPosts({ type: "FETCH_START" });
    try {
      const data = await api.posts.getAll(filters);
      dispatchPosts({ type: "FETCH_SUCCESS", payload: data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch posts";
      dispatchPosts({ type: "FETCH_ERROR", payload: message });
      showToast(message, "error");
    }
  }, [dispatchPosts, showToast]);

  const createPost = useCallback(
    async (content: string) => {
      try {
        const newPost = await api.posts.create({ content });
        dispatchPosts({ type: "ADD_POST", payload: newPost });
        showToast("Post created successfully!", "success");
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create post";
        showToast(message, "error");
        return false;
      }
    },
    [dispatchPosts, showToast]
  );

  const likePost = useCallback(
    async (postId: number) => {
      const post = posts.data.find((p) => p.id === postId);
      if (!post) return;

      // Optimistic update
      const newLiked = !post.liked;
      const newLikes = newLiked ? post.likes + 1 : post.likes - 1;
      dispatchPosts({
        type: "OPTIMISTIC_LIKE",
        payload: { id: postId, liked: newLiked, likes: newLikes },
      });

      try {
        await api.posts.like(postId);
      } catch {
        // Revert on failure
        dispatchPosts({
          type: "OPTIMISTIC_LIKE",
          payload: { id: postId, liked: post.liked, likes: post.likes },
        });
        showToast("Failed to like post", "error");
      }
    },
    [posts.data, dispatchPosts, showToast]
  );

  const deletePost = useCallback(
    async (postId: number) => {
      try {
        await api.posts.delete(postId);
        dispatchPosts({ type: "DELETE_POST", payload: postId });
        showToast("Post deleted", "success");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete post";
        showToast(message, "error");
      }
    },
    [dispatchPosts, showToast]
  );

  return { posts, fetchPosts, createPost, likePost, deletePost };
};
