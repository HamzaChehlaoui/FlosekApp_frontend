export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
