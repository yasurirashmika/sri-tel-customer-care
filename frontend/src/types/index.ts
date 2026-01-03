export interface User {
  id: number;
  mobileNumber: string;
  fullName: string;
  email: string;
  address: string;
  status: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
  success: boolean;
}

export interface LoginRequest {
  mobileNumber: string;
  password: string;
}

export interface RegisterRequest {
  mobileNumber: string;
  password: string;
  fullName: string;
  email: string;
  address: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
}