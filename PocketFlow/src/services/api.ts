// src/services/api.ts
// ─── Cấu hình URL ───────────────────────────────────────────
// Android Emulator  : 'http://10.0.2.2:3000/api'
// iOS Simulator     : 'http://localhost:3000/api'
// Thiết bị thật     : 'http://<IP_MÁY_TÍNH>:3000/api'  ← đổi IP này
// Production        : 'https://api.yourapp.com/api'

export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api'   // Android emulator (đổi thành localhost cho iOS)
  : 'https://api.yourapp.com/api';

// ─── Token storage (dùng AsyncStorage) ──────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@pocketflow_token';

export const TokenStorage = {
  get: () => AsyncStorage.getItem(TOKEN_KEY),
  set: (token: string) => AsyncStorage.setItem(TOKEN_KEY, token),
  remove: () => AsyncStorage.removeItem(TOKEN_KEY),
};

// ─── Base fetch wrapper ──────────────────────────────────────
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: Method;
  body?: object;
  requireAuth?: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, requireAuth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = await TokenStorage.get();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.message || 'Có lỗi xảy ra',
      response.status
    );
  }

  return data;
}
