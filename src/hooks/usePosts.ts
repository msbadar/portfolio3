import { useCallback } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

export const usePosts = () => {
  const { posts, dispatchPosts, showToast } = useApp();

  const fetchPosts = useCallback(async () => {
    dispatchPosts({ type: "FETCH_START" });
    try {
      const data = await api.posts.getAll();
      dispatchPosts({ type: "FETCH_SUCCESS", payload: data });
    } catch (error: any) {
      dispatchPosts({ type: "FETCH_ERROR", payload: error.message });
      showToast(error.message, "error");
    }
  }, [dispatchPosts, showToast]);

  const createPost = useCallback(
    async (content: string, user: any) => {
      try {
        const newPost = await api.posts.create({ content, user });
        dispatchPosts({ type: "ADD_POST", payload: newPost });
        showToast("Post created successfully!", "success");
        return true;
      } catch (error: any) {
        showToast(error.message, "error");
        return false;
      }
    },
    [dispatchPosts, showToast]
  );

  const likePost = useCallback(
    async (postId: number) => {
      const post = posts.data.find((p: any) => p.id === postId);
      if (!post) return;

      // Optimistic update
      const newLiked = !post.liked;
      const newLikes = newLiked ? post.likes + 1 : post.likes - 1;
      dispatchPosts({
        type: "OPTIMISTIC_LIKE",
        payload: { id: postId, liked: newLiked, likes: newLikes },
      });

      try {
        await api.posts.like(postId, newLiked);
      } catch (error) {
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
      } catch (error: any) {
        showToast(error.message, "error");
      }
    },
    [dispatchPosts, showToast]
  );

  return { posts, fetchPosts, createPost, likePost, deletePost };
};
