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

  const createBlog = useCallback(
    async (blogData: {
      title: string;
      content: string;
      excerpt: string;
      coverImage?: string;
      category: string;
      readTime: string;
    }) => {
      try {
        const newBlog = await api.blogs.create(blogData);
        dispatchBlogs({ type: "ADD_BLOG", payload: newBlog });
        showToast("Blog created successfully!", "success");
        return newBlog;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create blog";
        showToast(message, "error");
        throw error;
      }
    },
    [dispatchBlogs, showToast]
  );

  const updateBlog = useCallback(
    async (
      blogId: number,
      blogData: {
        title?: string;
        content?: string;
        excerpt?: string;
        coverImage?: string;
        category?: string;
        readTime?: string;
      }
    ) => {
      try {
        const updatedBlog = await api.blogs.update(blogId, blogData);
        dispatchBlogs({ type: "UPDATE_BLOG", payload: updatedBlog });
        showToast("Blog updated successfully!", "success");
        return updatedBlog;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update blog";
        showToast(message, "error");
        throw error;
      }
    },
    [dispatchBlogs, showToast]
  );

  const deleteBlog = useCallback(
    async (blogId: number) => {
      try {
        await api.blogs.delete(blogId);
        dispatchBlogs({ type: "DELETE_BLOG", payload: blogId });
        showToast("Blog deleted successfully!", "success");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete blog";
        showToast(message, "error");
        throw error;
      }
    },
    [dispatchBlogs, showToast]
  );

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

  return {
    blogs,
    fetchBlogs,
    selectBlog,
    clearSelection,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
  };
};
