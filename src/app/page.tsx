"use client";

import React, {
  useState,
  useEffect,
  useReducer,
  createContext,
  useContext,
  useCallback,
} from "react";

// ============================================
// API SERVICE LAYER
// ============================================

const API_DELAY = 800; // Simulate network delay

const api = {
  // Simulate API calls with delays
  async request(endpoint, options = {}) {
    await new Promise((resolve) => setTimeout(resolve, API_DELAY));

    // Simulate random failures (10% chance)
    if (Math.random() < 0.1 && options.canFail) {
      throw new Error("Network error. Please try again.");
    }

    return options.data;
  },

  // Posts API
  posts: {
    async getAll() {
      const data = await api.request("/posts", { data: initialPostsData });
      return data;
    },
    async create(post) {
      const newPost = {
        ...post,
        id: Date.now(),
        time: "now",
        likes: 0,
        comments: 0,
        reposts: 0,
        liked: false,
      };
      return api.request("/posts", { data: newPost });
    },
    async like(postId, liked) {
      return api.request(`/posts/${postId}/like`, { data: { postId, liked } });
    },
    async delete(postId) {
      return api.request(`/posts/${postId}`, { data: { postId } });
    },
  },

  // Blogs API
  blogs: {
    async getAll() {
      return api.request("/blogs", { data: initialBlogsData });
    },
    async getById(id) {
      const blog = initialBlogsData.find((b) => b.id === id);
      return api.request(`/blogs/${id}`, { data: blog });
    },
    async like(blogId, liked) {
      return api.request(`/blogs/${blogId}/like`, { data: { blogId, liked } });
    },
  },

  // Users API
  users: {
    async getSuggestions() {
      return api.request("/users/suggestions", { data: suggestionsData });
    },
    async follow(userId, following) {
      return api.request(`/users/${userId}/follow`, {
        data: { userId, following },
      });
    },
    async getCurrentUser() {
      return api.request("/users/me", { data: currentUserData });
    },
    async updateProfile(data) {
      return api.request("/users/me", {
        data: { ...currentUserData, ...data },
      });
    },
  },
};

// ============================================
// INITIAL DATA
// ============================================

const initialPostsData = [
  {
    id: 1,
    user: {
      id: 101,
      name: "Maya Chen",
      username: "mayachen",
      avatar: "https://i.pravatar.cc/150?img=1",
      verified: true,
    },
    content:
      "Just finished a 10-mile hike through the redwoods. The morning mist made everything feel like a dream ✨",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop",
    likes: 234,
    comments: 18,
    reposts: 5,
    time: "2h",
    liked: false,
  },
  {
    id: 2,
    user: {
      id: 102,
      name: "Alex Rivera",
      username: "alexcodes",
      avatar: "https://i.pravatar.cc/150?img=3",
      verified: true,
    },
    content:
      "Hot take: The best code is the code you delete. Spent all day removing 2000 lines and my app is faster than ever.",
    likes: 892,
    comments: 67,
    reposts: 124,
    time: "4h",
    liked: true,
  },
  {
    id: 3,
    user: {
      id: 103,
      name: "Jordan Kim",
      username: "jordankim",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: false,
    },
    content:
      "New studio setup complete! Finally have space to work on the mural series.",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop",
    likes: 456,
    comments: 32,
    reposts: 12,
    time: "6h",
    liked: false,
  },
];

const initialBlogsData = [
  {
    id: 1,
    title: "The Art of Minimalist Design in 2025",
    excerpt:
      "Exploring how less becomes more in modern digital experiences and why simplicity wins.",
    content: `In the ever-evolving landscape of digital design, minimalism has emerged not just as a trend, but as a fundamental philosophy.\n\n## The Philosophy Behind Minimalism\n\nMinimalist design isn't about removing elements until nothing is left—it's about removing elements until only the essential remains.\n\n### Key Principles\n\n**1. Intentional White Space**\nWhite space is not empty space. It's a powerful design element that guides the eye.\n\n**2. Typography as the Hero**\nWith fewer visual elements competing for attention, typography takes center stage.\n\nRemember: Good design is as little design as possible.`,
    coverImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400&fit=crop",
    readTime: "5 min read",
    date: "Dec 20, 2025",
    likes: 1243,
    comments: 89,
    category: "Design",
    liked: false,
  },
  {
    id: 2,
    title: "Building Scalable React Applications",
    excerpt:
      "A deep dive into architecture patterns that will save your team countless hours.",
    content: `After building React applications for nearly a decade, I've learned that architecture decisions matter most.\n\n## The Foundation\n\nEvery scalable React application needs three things: clear boundaries, predictable data flow, and testable components.\n\n## State Management in 2025\n\nThe days of Redux boilerplate are behind us. Modern state management focuses on server state vs client state separation.\n\nThe best architecture is one your team can understand and maintain.`,
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    readTime: "8 min read",
    date: "Dec 18, 2025",
    likes: 2891,
    comments: 156,
    category: "Development",
    liked: true,
  },
  {
    id: 3,
    title: "The Future of Remote Work Culture",
    excerpt:
      "How distributed teams are redefining collaboration and what it means for the future.",
    content: `Five years after the great remote work experiment began, we're finally seeing what works.\n\n## The New Normal\n\nRemote work isn't going away. But it's evolving.\n\n### Async-First Communication\n\nThe most successful remote teams have embraced asynchronous communication as their default.\n\nThe future of work isn't about location—it's about outcomes.`,
    coverImage:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
    readTime: "6 min read",
    date: "Dec 15, 2025",
    likes: 892,
    comments: 67,
    category: "Culture",
    liked: false,
  },
  {
    id: 4,
    title: "Mastering the Art of Side Projects",
    excerpt:
      "Why every developer should have a side project and how to actually finish one.",
    content: `We all have that graveyard of unfinished side projects. Here's how to break the cycle.\n\n## Why Side Projects Matter\n\nSide projects are more than resume padding. They're safe spaces to experiment.\n\n## The Completion Framework\n\nYour first version should be embarrassingly simple.\n\nNow stop reading and start building.`,
    coverImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop",
    readTime: "5 min read",
    date: "Dec 12, 2025",
    likes: 3421,
    comments: 234,
    category: "Productivity",
    liked: false,
  },
];

const suggestionsData = [
  {
    id: 1,
    name: "Emma Watson",
    username: "emmawatson",
    avatar: "https://i.pravatar.cc/150?img=10",
    verified: true,
    followers: "12.4M",
  },
  {
    id: 2,
    name: "David Park",
    username: "davidp",
    avatar: "https://i.pravatar.cc/150?img=11",
    verified: false,
    followers: "8.2K",
  },
  {
    id: 3,
    name: "Lisa Chen",
    username: "lisadesigns",
    avatar: "https://i.pravatar.cc/150?img=12",
    verified: true,
    followers: "234K",
  },
];

const currentUserData = {
  id: 0,
  name: "John Doe",
  username: "johndoe",
  avatar: "https://i.pravatar.cc/150?img=33",
  verified: true,
  bio: "Designer & Developer 🎨💻 | Building beautiful things | Coffee enthusiast ☕",
  followers: "12.5K",
  following: "892",
  link: "johndoe.design",
};

// ============================================
// STATE MANAGEMENT - REDUCERS
// ============================================

// Posts Reducer
const postsReducer = (state, action) => {
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
const blogsReducer = (state, action) => {
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
    case "TOGGLE_LIKE":
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
    default:
      return state;
  }
};

// UI Reducer
const uiReducer = (state, action) => {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_PROFILE_TAB":
      return { ...state, profileTab: action.payload };
    case "TOGGLE_COMPOSE":
      return { ...state, showCompose: action.payload ?? !state.showCompose };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, { id: Date.now(), ...action.payload }],
      };
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
const usersReducer = (state, action) => {
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

// ============================================
// CONTEXT & PROVIDERS
// ============================================

const AppContext = createContext(null);

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const AppProvider = ({ children }) => {
  const [posts, dispatchPosts] = useReducer(postsReducer, {
    data: [],
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
  const showToast = useCallback((message, type = "info") => {
    dispatchUI({ type: "ADD_TOAST", payload: { message, type } });
  }, []);

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

// ============================================
// CUSTOM HOOKS
// ============================================

// Fetch posts hook
const usePosts = () => {
  const { posts, dispatchPosts, showToast } = useApp();

  const fetchPosts = useCallback(async () => {
    dispatchPosts({ type: "FETCH_START" });
    try {
      const data = await api.posts.getAll();
      dispatchPosts({ type: "FETCH_SUCCESS", payload: data });
    } catch (error) {
      dispatchPosts({ type: "FETCH_ERROR", payload: error.message });
      showToast(error.message, "error");
    }
  }, [dispatchPosts, showToast]);

  const createPost = useCallback(
    async (content, user) => {
      try {
        const newPost = await api.posts.create({ content, user });
        dispatchPosts({ type: "ADD_POST", payload: newPost });
        showToast("Post created successfully!", "success");
        return true;
      } catch (error) {
        showToast(error.message, "error");
        return false;
      }
    },
    [dispatchPosts, showToast]
  );

  const likePost = useCallback(
    async (postId) => {
      const post = posts.data.find((p) => p.id === postId);
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
      } catch {
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
    async (postId) => {
      try {
        await api.posts.delete(postId);
        dispatchPosts({ type: "DELETE_POST", payload: postId });
        showToast("Post deleted", "success");
      } catch (error) {
        showToast(error.message, "error");
      }
    },
    [dispatchPosts, showToast]
  );

  return { posts, fetchPosts, createPost, likePost, deletePost };
};

// Fetch blogs hook
const useBlogs = () => {
  const { blogs, dispatchBlogs, showToast } = useApp();

  const fetchBlogs = useCallback(async () => {
    dispatchBlogs({ type: "FETCH_START" });
    try {
      const data = await api.blogs.getAll();
      dispatchBlogs({ type: "FETCH_SUCCESS", payload: data });
    } catch (error) {
      dispatchBlogs({ type: "FETCH_ERROR", payload: error.message });
      showToast(error.message, "error");
    }
  }, [dispatchBlogs, showToast]);

  const selectBlog = useCallback(
    (blog) => {
      dispatchBlogs({ type: "SELECT_BLOG", payload: blog });
    },
    [dispatchBlogs]
  );

  const clearSelection = useCallback(() => {
    dispatchBlogs({ type: "CLEAR_SELECTION" });
  }, [dispatchBlogs]);

  const likeBlog = useCallback(
    async (blogId) => {
      dispatchBlogs({ type: "TOGGLE_LIKE", payload: blogId });
      try {
        const blog = blogs.data.find((b) => b.id === blogId);
        await api.blogs.like(blogId, !blog?.liked);
      } catch {
        dispatchBlogs({ type: "TOGGLE_LIKE", payload: blogId }); // Revert
        showToast("Failed to like blog", "error");
      }
    },
    [blogs.data, dispatchBlogs, showToast]
  );

  return { blogs, fetchBlogs, selectBlog, clearSelection, likeBlog };
};

// Users hook
const useUsers = () => {
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
    async (userId) => {
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
    (blogId) => {
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

// ============================================
// ICONS
// ============================================

const Icons = {
  home: (active) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  search: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  create: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  activity: (active) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  profile: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  ),
  heart: (filled) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "url(#heartGradient)" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="2"
    >
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  comment: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  repost: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  share: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16,6 12,2 8,6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  ),
  verified: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="url(#verifiedGradient)" />
      <path
        d="M9 12l2 2 4-4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="verifiedGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  ),
  more: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="2" />
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  ),
  logo: () => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="url(#logoGradient)" />
      <path
        d="M24 14v20M14 24h20"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  ),
  menu: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  back: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  clock: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  bookmark: (filled) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  link: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  sparkle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  ),
  image: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  close: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  check: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  loader: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  ),
};

// ============================================
// COMPONENTS
// ============================================

// Toast Component
const Toast = ({ message, type, onClose }) => {
  const bgColor =
    type === "success"
      ? "bg-emerald-500"
      : type === "error"
      ? "bg-rose-500"
      : "bg-slate-700";
  const icon =
    type === "success"
      ? Icons.check()
      : type === "error"
      ? Icons.error()
      : null;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${bgColor} text-white rounded-xl shadow-lg animate-slideUp`}
    >
      {icon && <span>{icon}</span>}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        {Icons.close()}
      </button>
    </div>
  );
};

// Toast Container
const ToastContainer = () => {
  const { ui, dispatchUI } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {ui.toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() =>
            dispatchUI({ type: "REMOVE_TOAST", payload: toast.id })
          }
        />
      ))}
    </div>
  );
};

// Loading Skeleton
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

// Post Skeleton
const PostSkeleton = () => (
  <div className="flex gap-4 p-6">
    <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
    <div className="flex-1 space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  </div>
);

// Blog Skeleton
const BlogSkeleton = () => (
  <div className="flex bg-white rounded-3xl overflow-hidden border border-slate-200/50">
    <Skeleton className="w-[240px] h-[180px]" />
    <div className="flex-1 p-6 space-y-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

// Navigation Button
const NavButton = ({ id, icon, onClick, activeTab }) => (
  <button
    onClick={onClick}
    className={`group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
      activeTab === id
        ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
    }`}
  >
    {icon(activeTab === id)}
    {activeTab === id && (
      <span className="absolute -right-1 w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
    )}
  </button>
);

// Sidebar Component
const Sidebar = () => {
  const { ui, dispatchUI } = useApp();

  const navItems = [
    { id: "home", icon: Icons.home },
    { id: "search", icon: Icons.search },
    {
      id: "create",
      icon: Icons.create,
      onClick: () => dispatchUI({ type: "TOGGLE_COMPOSE", payload: true }),
    },
    { id: "activity", icon: Icons.activity },
    { id: "profile", icon: Icons.profile },
  ];

  return (
    <nav className="w-20 flex flex-col items-center py-6 fixed left-0 top-0 bottom-0 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 z-50">
      <div className="mb-8">{Icons.logo()}</div>
      <div className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            id={item.id}
            icon={item.icon}
            activeTab={ui.activeTab}
            onClick={
              item.onClick ||
              (() => dispatchUI({ type: "SET_ACTIVE_TAB", payload: item.id }))
            }
          />
        ))}
      </div>
      <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 transition-all">
        {Icons.menu()}
      </button>
    </nav>
  );
};

// Right Sidebar Component
const RightSidebar = () => {
  const { users, toggleFollow, fetchSuggestions } = useUsers();
  const { ui, dispatchUI } = useApp();

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return (
    <aside className="w-[380px] p-8 fixed right-0 top-0 bottom-0 overflow-y-auto bg-white/50 backdrop-blur-xl border-l border-slate-200/50">
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Search anything..."
          value={ui.searchQuery}
          onChange={(e) =>
            dispatchUI({ type: "SET_SEARCH_QUERY", payload: e.target.value })
          }
          className="w-full px-5 py-3.5 pl-12 bg-slate-100 border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {Icons.search()}
        </span>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 border border-slate-200/50 shadow-xl shadow-slate-200/20 mb-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xs">
            ✨
          </span>
          Who to follow
        </h3>
        {users.suggestions.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-9 w-20 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          users.suggestions.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 py-3.5 border-b border-slate-100 last:border-0"
            >
              <img
                src={user.avatar}
                alt=""
                className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-sm">
                  {user.username}
                  {user.verified && Icons.verified()}
                </div>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {user.followers} followers
                </span>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                  users.following[user.id]
                    ? "bg-slate-100 text-slate-700"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40"
                }`}
              >
                {users.following[user.id] ? "Following" : "Follow"}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-slate-400 space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {["About", "Help", "Privacy", "Terms", "Careers"].map((link) => (
            <a
              key={link}
              href="#"
              className="hover:text-slate-600 transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
        <p>© 2025 Threadz</p>
      </div>
    </aside>
  );
};

// Post Component
const Post = ({ post, onLike }) => (
  <article className="flex gap-4 p-6 hover:bg-slate-50/50 transition-all">
    <img
      src={post.user.avatar}
      alt=""
      className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[15px]">{post.user.username}</span>
          {post.user.verified && <span className="flex-shrink-0">{Icons.verified()}</span>}
          <span className="text-slate-400 text-sm">• {post.time}</span>
        </div>
        <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all flex-shrink-0 -mt-1">
          {Icons.more()}
        </button>
      </div>
      <p className="text-[15px] leading-relaxed mb-3.5">{post.content}</p>
      {post.image && (
        <div className="mb-4 rounded-2xl overflow-hidden">
          <img
            src={post.image}
            alt=""
            className="w-full max-h-[400px] object-cover"
          />
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            post.liked
              ? "text-rose-500 bg-rose-50"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          {Icons.heart(post.liked)} {formatCount(post.likes)}
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 font-medium transition-all">
          {Icons.comment()} {post.comments}
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 font-medium transition-all">
          {Icons.repost()} {post.reposts}
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 font-medium transition-all">
          {Icons.share()}
        </button>
      </div>
    </div>
  </article>
);

// Blog Card Component
const BlogCard = ({ blog, onClick, index }) => (
  <article
    onClick={() => onClick(blog)}
    className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/50 hover:border-slate-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer"
    style={{ animation: `slideUp 0.5s ease ${index * 0.1}s both` }}
  >
    <div className="flex items-stretch">
      <div className="relative w-[240px] overflow-hidden flex-shrink-0">
        <img
          src={blog.coverImage}
          alt=""
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold rounded-full">
              {blog.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              {Icons.clock()} {blog.readTime}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2.5 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-slate-500 text-sm mb-4 line-clamp-2">
            {blog.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{blog.date}</span>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              {Icons.heart(false)} {formatCount(blog.likes)}
            </span>
            <span className="flex items-center gap-1.5">
              {Icons.comment()} {formatCount(blog.comments)}
            </span>
          </div>
        </div>
      </div>
    </div>
  </article>
);

// Compose Modal Component
const ComposeModal = () => {
  const { ui, dispatchUI } = useApp();
  const { createPost } = usePosts();
  const { users } = useUsers();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const success = await createPost(content, users.currentUser);
    if (success) {
      setContent("");
      dispatchUI({ type: "TOGGLE_COMPOSE", payload: false });
    }
    setIsSubmitting(false);
  };

  if (!ui.showCompose) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000]"
      onClick={() => dispatchUI({ type: "TOGGLE_COMPOSE", payload: false })}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[580px] shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <button
            onClick={() =>
              dispatchUI({ type: "TOGGLE_COMPOSE", payload: false })
            }
            className="text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <span className="font-bold text-lg">New Thread</span>
          <div className="w-[60px]" />
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
              <img
                src={
                  users.currentUser?.avatar ||
                  "https://i.pravatar.cc/150?img=33"
                }
                alt=""
                className="w-12 h-12 rounded-2xl object-cover"
              />
              <div className="w-0.5 flex-1 bg-gradient-to-b from-slate-200 to-transparent mt-3 rounded-full min-h-[40px]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-[15px] block mb-2.5">
                {users.currentUser?.username || "you"}
              </span>
              <textarea
                placeholder="Start a thread..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
                className="w-full border-none text-[16px] leading-relaxed resize-none outline-none min-h-[120px] placeholder-slate-400"
              />
              <div className="flex gap-2 mt-3">
                <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                  {Icons.image()}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
          <span className="text-sm text-slate-400">Anyone can reply</span>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              content.trim() && !isSubmitting
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting && Icons.loader()}
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Profile Header Component
const ProfileHeader = () => {
  const { users } = useUsers();
  const user = users.currentUser;

  if (!user) {
    return (
      <div className="relative">
        <Skeleton className="h-32 rounded-none" />
        <div className="px-8 pb-6">
          <div className="flex items-end gap-6 -mt-12 mb-6">
            <Skeleton className="w-28 h-28 rounded-3xl" />
            <div className="flex-1 pb-2 space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex gap-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="px-8 pb-6">
        <div className="flex items-end gap-6 -mt-12 mb-6">
          <img
            src={user.avatar}
            alt=""
            className="w-28 h-28 rounded-3xl object-cover ring-4 ring-white shadow-2xl flex-shrink-0"
          />
          <div className="flex-1 pb-2 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <span className="flex-shrink-0">{user.verified && Icons.verified()}</span>
            </div>
            <span className="text-slate-500">@{user.username}</span>
          </div>
          <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all flex-shrink-0">
            Edit Profile
          </button>
        </div>
        <p className="text-slate-600 mb-4 max-w-2xl leading-relaxed">{user.bio}</p>
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <span className="text-slate-500">
            <strong className="text-slate-900 font-semibold">{user.followers}</strong>{" "}
            followers
          </span>
          <span className="text-slate-500">
            <strong className="text-slate-900 font-semibold">{user.following}</strong>{" "}
            following
          </span>
          <a
            href="#"
            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            {Icons.link()} {user.link}
          </a>
        </div>
      </div>
    </div>
  );
};

// Blog Detail View Component
const BlogDetailView = () => {
  const { blogs, clearSelection, likeBlog } = useBlogs();
  const { users, toggleBookmark } = useUsers();
  const blog = blogs.selected;

  const renderMarkdown = (content) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## "))
        return (
          <h2
            key={i}
            className="text-2xl font-bold mt-10 mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
          >
            {line.replace("## ", "")}
          </h2>
        );
      if (line.startsWith("### "))
        return (
          <h3
            key={i}
            className="text-xl font-semibold mt-8 mb-3 text-slate-800"
          >
            {line.replace("### ", "")}
          </h3>
        );
      if (line.startsWith("**") && line.endsWith("**"))
        return (
          <p key={i} className="font-semibold mt-6 mb-2 text-slate-900">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      if (line.startsWith("- "))
        return (
          <li key={i} className="ml-6 mb-2 text-slate-600 list-disc">
            {line.replace("- ", "")}
          </li>
        );
      if (line.trim() === "") return <div key={i} className="h-4" />;
      return (
        <p key={i} className="mb-4 leading-[1.8] text-slate-600">
          {line}
        </p>
      );
    });
  };

  if (!blog) return null;

  return (
    <main className="flex-1 max-w-[680px] ml-20 mr-[380px]">
      <header className="sticky top-0 z-10 px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <button
            onClick={clearSelection}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-all"
          >
            {Icons.back()}
          </button>
          <span className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Article
          </span>
        </div>
      </header>

      <article className="animate-fadeIn">
        <div className="relative h-[360px] overflow-hidden">
          <img
            src={blog.coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full mb-4">
              {Icons.sparkle()}
              {blog.category}
            </span>
            <h1 className="text-4xl font-bold text-white leading-tight">
              {blog.title}
            </h1>
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="flex items-center gap-4 pb-8 border-b border-slate-200">
            <div className="relative flex-shrink-0">
              <img
                src={users.currentUser?.avatar}
                alt=""
                className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  {users.currentUser?.name}
                </span>
                <span className="flex-shrink-0">{Icons.verified()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                <span>{blog.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  {Icons.clock()} {blog.readTime}
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleBookmark(blog.id)}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                users.bookmarks[blog.id]
                  ? "bg-indigo-100 text-indigo-600"
                  : "hover:bg-slate-100 text-slate-400"
              }`}
            >
              {Icons.bookmark(users.bookmarks[blog.id])}
            </button>
          </div>

          <div className="py-8 text-[17px]">{renderMarkdown(blog.content)}</div>

          <div className="flex items-center gap-2 py-6 border-t border-slate-200">
            <button
              onClick={() => likeBlog(blog.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                blog.liked
                  ? "bg-rose-50 text-rose-600"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              {Icons.heart(blog.liked)}
              <span>{formatCount(blog.likes)}</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-all">
              {Icons.comment()} {formatCount(blog.comments)}
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-all ml-auto">
              {Icons.share()} Share
            </button>
          </div>

          <div className="py-8 border-t border-slate-200">
            <h3 className="text-lg font-bold mb-6">More articles</h3>
            <div className="grid gap-4">
              {blogs.data
                .filter((b) => b.id !== blog.id)
                .slice(0, 2)
                .map((b) => (
                  <div
                    key={b.id}
                    onClick={() =>
                      blogs.dispatchBlogs?.({ type: "SELECT_BLOG", payload: b })
                    }
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/50 hover:border-slate-300 cursor-pointer transition-all hover:shadow-lg hover:shadow-slate-200/50"
                  >
                    <img
                      src={b.coverImage}
                      alt=""
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-indigo-600 block mb-1">
                        {b.category}
                      </span>
                      <h4 className="font-semibold group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5">
                        {b.title}
                      </h4>
                      <span className="text-sm text-slate-500 block">
                        {b.readTime}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
};

// Helper function
const formatCount = (num) => {
  if (typeof num === "string") return num;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

// ============================================
// MAIN APP COMPONENT
// ============================================

const MainContent = () => {
  const { ui, dispatchUI } = useApp();
  const { posts, fetchPosts, likePost } = usePosts();
  const { blogs, fetchBlogs, selectBlog } = useBlogs();
  const { fetchCurrentUser } = useUsers();

  // Initial data fetch
  useEffect(() => {
    fetchPosts();
    fetchBlogs();
    fetchCurrentUser();
  }, [fetchPosts, fetchBlogs, fetchCurrentUser]);

  // If blog is selected, show blog detail view
  if (blogs.selected) {
    return (
      <>
        <Sidebar />
        <BlogDetailView />
        <RightSidebar />
      </>
    );
  }

  return (
    <>
      <Sidebar />

      <main className="flex-1 max-w-[680px] ml-20 mr-[380px]">
        <ProfileHeader />

        {/* Tabs */}
        <div className="flex gap-2 px-6 border-b border-slate-200">
          {["threads", "blogs", "replies", "reposts"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                dispatchUI({ type: "SET_PROFILE_TAB", payload: tab })
              }
              className={`px-5 py-4 font-semibold text-sm capitalize relative transition-all ${
                ui.profileTab === tab
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
              {ui.profileTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {ui.profileTab === "blogs" ? (
          <div className="p-6 grid gap-6">
            {blogs.loading ? (
              [1, 2, 3].map((i) => <BlogSkeleton key={i} />)
            ) : blogs.error ? (
              <div className="text-center py-12">
                <p className="text-rose-500 mb-4">{blogs.error}</p>
                <button
                  onClick={fetchBlogs}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : (
              blogs.data.map((blog, i) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  onClick={selectBlog}
                  index={i}
                />
              ))
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {posts.loading ? (
              [1, 2, 3].map((i) => <PostSkeleton key={i} />)
            ) : posts.error ? (
              <div className="text-center py-12">
                <p className="text-rose-500 mb-4">{posts.error}</p>
                <button
                  onClick={fetchPosts}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : (
              posts.data.map((post, i) => (
                <div
                  key={post.id}
                  style={{ animation: `slideUp 0.4s ease ${i * 0.05}s both` }}
                >
                  <Post post={post} onLike={likePost} />
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <RightSidebar />
      <ComposeModal />
    </>
  );
};

// Root App with Provider
export default function App() {
  return (
    <AppProvider>
      <div className="flex justify-between min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 font-sans text-slate-900">
        <style>{globalStyles}</style>
        <MainContent />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}

// Global Styles
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  .animate-fadeIn { animation: fadeIn 0.4s ease; }
  .animate-scaleIn { animation: scaleIn 0.25s ease; }
  .animate-slideUp { animation: slideUp 0.3s ease; }
  .animate-spin { animation: spin 1s linear infinite; }
  .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
`;
