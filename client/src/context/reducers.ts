import type {
  PostsState,
  PostsAction,
  BlogsState,
  BlogsAction,
  UIState,
  UIAction,
  UsersState,
  UsersAction,
  Toast,
} from "@/types";

// Posts Reducer
export const postsReducer = (state: PostsState, action: PostsAction): PostsState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, data: action.payload, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "ADD_POST":
      return { ...state, data: [action.payload, ...state.data] };
    case "DELETE_POST":
      return {
        ...state,
        data: state.data.filter((p) => p.id !== action.payload),
      };
    case "TOGGLE_LIKE":
      return {
        ...state,
        data: state.data.map((p) =>
          p.id === action.payload
            ? {
                ...p,
                liked: !p.liked,
                likes: p.liked ? p.likes - 1 : p.likes + 1,
              }
            : p
        ),
      };
    case "OPTIMISTIC_LIKE":
      return {
        ...state,
        data: state.data.map((p) =>
          p.id === action.payload.id
            ? { ...p, liked: action.payload.liked, likes: action.payload.likes }
            : p
        ),
      };
    default:
      return state;
  }
};

// Blogs Reducer
export const blogsReducer = (state: BlogsState, action: BlogsAction): BlogsState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, data: action.payload, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SELECT_BLOG":
      return { ...state, selected: action.payload };
    case "CLEAR_SELECTION":
      return { ...state, selected: null };
    case "TOGGLE_LIKE": {
      const updatedData = state.data.map((b) =>
        b.id === action.payload
          ? {
              ...b,
              liked: !b.liked,
              likes: b.liked ? b.likes - 1 : b.likes + 1,
            }
          : b
      );
      const updatedSelected =
        state.selected?.id === action.payload
          ? {
              ...state.selected,
              liked: !state.selected.liked,
              likes: state.selected.liked
                ? state.selected.likes - 1
                : state.selected.likes + 1,
            }
          : state.selected;
      return { ...state, data: updatedData, selected: updatedSelected };
    }
    default:
      return state;
  }
};

// UI Reducer
export const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_PROFILE_TAB":
      return { ...state, profileTab: action.payload };
    case "TOGGLE_COMPOSE":
      return { ...state, showCompose: action.payload ?? !state.showCompose };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "ADD_TOAST": {
      const newToast: Toast = {
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type,
      };
      return {
        ...state,
        toasts: [...state.toasts, newToast],
      };
    }
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    default:
      return state;
  }
};

// Users Reducer
export const usersReducer = (state: UsersState, action: UsersAction): UsersState => {
  switch (action.type) {
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload };
    case "SET_SUGGESTIONS":
      return { ...state, suggestions: action.payload };
    case "TOGGLE_FOLLOW":
      return {
        ...state,
        following: {
          ...state.following,
          [action.payload]: !state.following[action.payload],
        },
      };
    case "SET_BOOKMARKS":
      return {
        ...state,
        bookmarks: {
          ...state.bookmarks,
          [action.payload]: !state.bookmarks[action.payload],
        },
      };
    default:
      return state;
  }
};
