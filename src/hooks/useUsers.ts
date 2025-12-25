import { useCallback } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

export const useUsers = () => {
  const { users, dispatchUsers, showToast } = useApp();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const user = await api.users.getCurrentUser();
      dispatchUsers({ type: "SET_CURRENT_USER", payload: user });
    } catch {
      showToast("Failed to load user", "error");
    }
  }, [dispatchUsers, showToast]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const suggestions = await api.users.getSuggestions();
      dispatchUsers({ type: "SET_SUGGESTIONS", payload: suggestions });
    } catch {
      showToast("Failed to load suggestions", "error");
    }
  }, [dispatchUsers, showToast]);

  const toggleFollow = useCallback(
    async (userId: number) => {
      dispatchUsers({ type: "TOGGLE_FOLLOW", payload: userId });
      try {
        await api.users.follow(userId, !users.following[userId]);
      } catch {
        dispatchUsers({ type: "TOGGLE_FOLLOW", payload: userId }); // Revert
        showToast("Failed to follow user", "error");
      }
    },
    [users.following, dispatchUsers, showToast]
  );

  const toggleBookmark = useCallback(
    (blogId: number) => {
      dispatchUsers({ type: "SET_BOOKMARKS", payload: blogId });
    },
    [dispatchUsers]
  );

  return {
    users,
    fetchCurrentUser,
    fetchSuggestions,
    toggleFollow,
    toggleBookmark,
  };
};
