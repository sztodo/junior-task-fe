export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  location: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  authUserId: number;
  userId: number;
}

export interface AuthUser {
  email: string;
  role: string;
  authUserId: number;
  linkedUserId: number;
}
