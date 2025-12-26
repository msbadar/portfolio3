// User types
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  bio?: string;
  followers?: string;
  following?: string;
  link?: string;
}

export interface Suggestion {
  id: number;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followers: string;
}

// Post types
export interface PostUser {
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
}

export type PostType = "post" | "blog" | "comment";

export interface Post {
  id: number;
  type?: PostType;
  user: PostUser;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  reposts: number;
  time: string;
  liked: boolean;
  parentId?: number;
}

// Blog types (stored as posts with type='blog')
export interface Blog {
  id: number;
  type?: PostType;
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

// Comment types (stored as posts with type='comment')
export interface Comment {
  id: number;
  type: "comment";
  parentId: number;
  user: PostUser;
  content: string;
  likes: number;
  comments: number;
  time: string;
  liked: boolean;
}

// State types
export interface PostsState {
  data: Post[];
  loading: boolean;
  error: string | null;
}

export interface BlogsState {
  data: Blog[];
  loading: boolean;
  error: string | null;
  selected: Blog | null;
}

export interface UIState {
  activeTab: string;
  profileTab: string;
  showCompose: boolean;
  searchQuery: string;
  toasts: Toast[];
}

export interface UsersState {
  currentUser: User | null;
  suggestions: Suggestion[];
  following: Record<number, boolean>;
  bookmarks: Record<number, boolean>;
}

// Toast types
export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

// Action types
export type PostsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Post[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "ADD_POST"; payload: Post }
  | { type: "DELETE_POST"; payload: number }
  | { type: "TOGGLE_LIKE"; payload: number }
  | { type: "OPTIMISTIC_LIKE"; payload: { id: number; liked: boolean; likes: number } };

export type BlogsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Blog[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "SELECT_BLOG"; payload: Blog }
  | { type: "CLEAR_SELECTION" }
  | { type: "TOGGLE_LIKE"; payload: number };

export type UIAction =
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "SET_PROFILE_TAB"; payload: string }
  | { type: "TOGGLE_COMPOSE"; payload?: boolean }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "ADD_TOAST"; payload: { message: string; type: "success" | "error" | "info" } }
  | { type: "REMOVE_TOAST"; payload: number };

export type UsersAction =
  | { type: "SET_CURRENT_USER"; payload: User }
  | { type: "SET_SUGGESTIONS"; payload: Suggestion[] }
  | { type: "TOGGLE_FOLLOW"; payload: number }
  | { type: "SET_BOOKMARKS"; payload: number };
