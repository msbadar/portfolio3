export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface User {
  id: number | string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  followers?: string;
  following?: string;
  link?: string;
  bio?: string;
}

export interface Post {
  id: number;
  user: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  reposts: number;
  time: string;
  liked: boolean;
}

export interface Blog {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  readTime: string;
  date: string;
  likes: number;
  comments: number;
  category: string;
  liked: boolean;
}

export interface PostsState {
  data: Post[];
  loading: boolean;
  error: string | null;
}

export type PostsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Post[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "ADD_POST"; payload: Post }
  | { type: "DELETE_POST"; payload: number }
  | { type: "TOGGLE_LIKE"; payload: number }
  | { type: "OPTIMISTIC_LIKE"; payload: { id: number; liked: boolean; likes: number } };

export interface BlogsState {
  data: Blog[];
  loading: boolean;
  error: string | null;
  selected: Blog | null;
}

export type BlogsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Blog[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "SELECT_BLOG"; payload: Blog }
  | { type: "CLEAR_SELECTION" }
  | { type: "TOGGLE_LIKE"; payload: number };

export interface UIState {
  activeTab: string;
  profileTab: string;
  showCompose: boolean;
  searchQuery: string;
  toasts: ToastMessage[];
}

export type UIAction =
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "SET_PROFILE_TAB"; payload: string }
  | { type: "TOGGLE_COMPOSE"; payload?: boolean }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "ADD_TOAST"; payload: Omit<ToastMessage, "id"> }
  | { type: "REMOVE_TOAST"; payload: number };

export interface UsersState {
  currentUser: User | null;
  suggestions: User[];
  following: Record<number, boolean>;
  bookmarks: Record<number, boolean>;
}

export type UsersAction =
  | { type: "SET_CURRENT_USER"; payload: User }
  | { type: "SET_SUGGESTIONS"; payload: User[] }
  | { type: "TOGGLE_FOLLOW"; payload: number }
  | { type: "SET_BOOKMARKS"; payload: number };
