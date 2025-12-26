"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import {
  postsReducer,
  blogsReducer,
  uiReducer,
  usersReducer,
} from "./reducers";
import type {
  Post,
  PostsState,
  PostsAction,
  BlogsState,
  BlogsAction,
  UIState,
  UIAction,
  UsersState,
  UsersAction,
} from "@/types";

interface AppContextType {
  posts: PostsState;
  dispatchPosts: React.Dispatch<PostsAction>;
  blogs: BlogsState;
  dispatchBlogs: React.Dispatch<BlogsAction>;
  ui: UIState;
  dispatchUI: React.Dispatch<UIAction>;
  users: UsersState;
  dispatchUsers: React.Dispatch<UsersAction>;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
  initialPosts?: Post[];
}

export const AppProvider = ({
  children,
  initialPosts = [],
}: AppProviderProps) => {
  const [posts, dispatchPosts] = useReducer(postsReducer, {
    data: initialPosts,
    loading: false,
    error: null,
  });

  const [blogs, dispatchBlogs] = useReducer(blogsReducer, {
    data: [],
    loading: false,
    error: null,
    selected: null,
  });

  const [ui, dispatchUI] = useReducer(uiReducer, {
    activeTab: "home",
    profileTab: "threads",
    showCompose: false,
    searchQuery: "",
    toasts: [],
  });

  const [users, dispatchUsers] = useReducer(usersReducer, {
    currentUser: null,
    suggestions: [],
    following: {},
    bookmarks: {},
  });

  // Toast helper
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      dispatchUI({ type: "ADD_TOAST", payload: { message, type } });
    },
    []
  );

  // Auto-remove toasts
  useEffect(() => {
    if (ui.toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatchUI({ type: "REMOVE_TOAST", payload: ui.toasts[0].id });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [ui.toasts]);

  const value = {
    posts,
    dispatchPosts,
    blogs,
    dispatchBlogs,
    ui,
    dispatchUI,
    users,
    dispatchUsers,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
