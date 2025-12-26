// API URL configuration
// In production, NEXT_PUBLIC_API_URL must be set, otherwise we throw an error
// In development, we fall back to localhost
const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    return apiUrl;
  }
  // Development fallback - only works when running locally
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api';
  }
  // Production without API URL configured - use relative path
  return '/api';
};

const API_URL = getApiUrl();

let authToken: string | null = null;

// Token management
export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token');
  }
  return null;
};

// Initialize token from storage
if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('auth-token');
}

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Include site header if configured
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;
  if (siteName) {
    headers['X-Site'] = siteName;
  }
  return headers;
};

// Event types for fetch lifecycle
export interface FetchEventDetail {
  url: string;
  method: string;
  timestamp: number;
}

export interface FetchErrorEventDetail extends FetchEventDetail {
  error: Error;
}

export interface FetchSuccessEventDetail extends FetchEventDetail {
  status: number;
  statusText: string;
}

// Event names
export const FETCH_EVENTS = {
  START: 'fetch_start',
  SUCCESS: 'fetch_success',
  ERROR: 'fetch_error',
} as const;

// Dispatch custom events for fetch lifecycle
const dispatchFetchEvent = <T extends FetchEventDetail>(
  eventName: string,
  detail: T
) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(eventName, { detail })
    );
  }
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const method = options.method || 'GET';
  const timestamp = Date.now();

  // Dispatch fetch_start event
  dispatchFetchEvent(FETCH_EVENTS.START, {
    url,
    method,
    timestamp,
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      const errorObj = new Error(error.message || error.error || 'Request failed');

      // Dispatch fetch_error event
      dispatchFetchEvent(FETCH_EVENTS.ERROR, {
        url,
        method,
        timestamp,
        error: errorObj,
      });

      throw errorObj;
    }

    // Dispatch fetch_success event
    dispatchFetchEvent(FETCH_EVENTS.SUCCESS, {
      url,
      method,
      timestamp,
      status: response.status,
      statusText: response.statusText,
    });

    return response.json();
  } catch (error) {
    // Dispatch fetch_error event for network errors
    const errorObj = error instanceof Error ? error : new Error('Network error');
    dispatchFetchEvent(FETCH_EVENTS.ERROR, {
      url,
      method,
      timestamp,
      error: errorObj,
    });

    throw error;
  }
}

// Helper function to build query strings from params object
const buildQueryString = (params?: Record<string, unknown>): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, unknown>) =>
    apiRequest<T>(`${endpoint}${buildQueryString(params)}`),
  post: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, {
      method: 'DELETE',
    }),
};
