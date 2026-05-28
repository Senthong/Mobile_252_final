// src/services/authService.ts
import { apiRequest, TokenStorage } from './api';
import { User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dob?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

// ─── Đăng nhập ───────────────────────────────────────────────
export async function login(payload: LoginPayload): Promise<AuthResponse['data']> {
  const res = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    requireAuth: false,
  });
  // Lưu token tự động
  await TokenStorage.set(res.data.token);
  return res.data;
}

// ─── Đăng ký ─────────────────────────────────────────────────
export async function register(payload: RegisterPayload): Promise<AuthResponse['data']> {
  const res = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
    requireAuth: false,
  });
  await TokenStorage.set(res.data.token);
  return res.data;
}

// ─── Đăng xuất ───────────────────────────────────────────────
export async function logout(): Promise<void> {
  await TokenStorage.remove();
}

// ─── Lấy thông tin user hiện tại ─────────────────────────────
export async function getMe(): Promise<User> {
  const res = await apiRequest<{ success: boolean; data: User }>('/auth/me');
  return res.data;
}

// ─── Kiểm tra đã đăng nhập chưa ──────────────────────────────
export async function isAuthenticated(): Promise<boolean> {
  const token = await TokenStorage.get();
  return !!token;
}
