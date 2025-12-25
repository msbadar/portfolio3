import { useCallback } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

export const useBlogs = () => {
  const { blogs, dispatchBlogs, showToast } = useApp();

  const fetchBlogs = useCallback(async () => {
    dispatchBlogs({ type: "FETCH_START" });
    try {
      const data = await api.blogs.getAll();
      dispatchBlogs({ type: "FETCH_SUCCESS", payload: data });
    } catch (error: any) {
      dispatchBlogs({ type: "FETCH_ERROR", payload: error.message });
      showToast(error.message, "error");
    }
  }, [dispatchBlogs, showToast]);

  const selectBlog = useCallback(
    (blog: any) => {
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
        const blog = blogs.data.find((b: any) => b.id === blogId);
        await api.blogs.like(blogId, !blog?.liked);
      } catch (error) {
        dispatchBlogs({ type: "TOGGLE_LIKE", payload: blogId }); // Revert
        showToast("Failed to like blog", "error");
      }
    },
    [blogs.data, dispatchBlogs, showToast]
  );

  return { blogs, fetchBlogs, selectBlog, clearSelection, likeBlog };
};
