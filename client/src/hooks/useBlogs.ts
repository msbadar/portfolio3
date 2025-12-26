import { useCallback } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";
import type { Blog } from "@/types";

export const useBlogs = () => {
  const { blogs, dispatchBlogs, showToast } = useApp();

  const fetchBlogs = useCallback(async () => {
    dispatchBlogs({ type: "FETCH_START" });
    try {
      const data = await api.blogs.getAll();
      dispatchBlogs({ type: "FETCH_SUCCESS", payload: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch blogs";
      dispatchBlogs({ type: "FETCH_ERROR", payload: message });
      showToast(message, "error");
    }
  }, [dispatchBlogs, showToast]);

  const selectBlog = useCallback(
    (blog: Blog) => {
      dispatchBlogs({ type: "SELECT_BLOG", payload: blog });
    },
    [dispatchBlogs]
  );

  const clearSelection = useCallback(() => {
    dispatchBlogs({ type: "CLEAR_SELECTION" });
  }, [dispatchBlogs]);

  const likeBlog = useCallback(
    async (blogId: number) => {
      dispatchBlogs({ type: "TOGGLE_LIKE", payload: blogId });
      try {
        await api.blogs.like(blogId);
      } catch {
        dispatchBlogs({ type: "TOGGLE_LIKE", payload: blogId }); // Revert
        showToast("Failed to like blog", "error");
      }
    },
    [dispatchBlogs, showToast]
  );

  return { blogs, fetchBlogs, selectBlog, clearSelection, likeBlog };
};
