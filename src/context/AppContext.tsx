"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { postsReducer, blogsReducer, uiReducer, usersReducer } from "./reducers";
import {
  BlogsAction,
  BlogsState,
  PostsAction,
  PostsState,
  ToastType,
  UIAction,
  UIState,
  UsersAction,
  UsersState,
} from "@/types/app";

interface AppContextType {
  posts: PostsState;
  dispatchPosts: React.Dispatch<PostsAction>;
  blogs: BlogsState;
  dispatchBlogs: React.Dispatch<BlogsAction>;
  ui: UIState;
  dispatchUI: React.Dispatch<UIAction>;
  users: UsersState;
  dispatchUsers: React.Dispatch<UsersAction>;
  showToast: (message: string, type?: ToastType) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const initialPostsState: PostsState = {
  data: [],
  loading: false,
  error: null,
};

const initialBlogsState: BlogsState = {
  data: [],
  loading: false,
  error: null,
  selected: null,
};

const initialUIState: UIState = {
  activeTab: "home",
  profileTab: "threads",
  showCompose: false,
  searchQuery: "",
  toasts: [],
};

const initialUsersState: UsersState = {
  currentUser: null,
  suggestions: [],
  following: {},
  bookmarks: {},
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, dispatchPosts] = useReducer(postsReducer, initialPostsState);

  const [blogs, dispatchBlogs] = useReducer(blogsReducer, initialBlogsState);

  const [ui, dispatchUI] = useReducer(uiReducer, initialUIState);

  const [users, dispatchUsers] = useReducer(usersReducer, initialUsersState);

  // Toast helper
  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      dispatchUI({ type: "ADD_TOAST", payload: { message, type } });
    },
    [dispatchUI]
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
