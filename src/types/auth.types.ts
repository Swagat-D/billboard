export interface User {
  id: string;
  email: string;
  name: string;
  gender?: Gender;
  phoneNumber?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: Gender;
  phoneNumber: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  emailVerified: boolean;
}

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}