// Auth types
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  username: string;
  avatar: string | null;
  verified: boolean;
  bio: string | null;
  followers: number;
  following: number;
  link: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}
