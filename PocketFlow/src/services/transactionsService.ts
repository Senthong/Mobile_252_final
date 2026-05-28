// src/services/transactionsService.ts
import { apiRequest } from './api';
import { Transaction, TransactionType } from '../types';

export interface TransactionsFilter {
  limit?: number;
  offset?: number;
  type?: TransactionType;
  category_id?: string;
  account_id?: string;
  month?: string; // "YYYY-MM"
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  total: number;
}

export interface CreateTransactionPayload {
  amount: number;
  type: TransactionType;
  category_id: string;
  account_id: string;
  note?: string;
  date?: string;
}

export interface SummaryResponse {
  success: boolean;
  data: {
    income: number;
    expense: number;
    balance: number;
    incomeCount: number;
    expenseCount: number;
  };
}

// ─── Lấy danh sách giao dịch ─────────────────────────────────
export async function getTransactions(
  filters: TransactionsFilter = {}
): Promise<TransactionsResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<TransactionsResponse>(`/transactions${query}`);
}

// ─── Tạo giao dịch mới ────────────────────────────────────────
export async function createTransaction(
  payload: CreateTransactionPayload
): Promise<{ success: boolean; data: Transaction }> {
  return apiRequest('/transactions', {
    method: 'POST',
    body: payload,
  });
}

// ─── Xóa giao dịch ────────────────────────────────────────────
export async function deleteTransaction(id: string): Promise<void> {
  await apiRequest(`/transactions/${id}`, { method: 'DELETE' });
}

// ─── Lấy tổng kết thu/chi ────────────────────────────────────
export async function getSummary(month?: string): Promise<SummaryResponse['data']> {
  const query = month ? `?month=${month}` : '';
  const res = await apiRequest<SummaryResponse>(`/transactions/summary${query}`);
  return res.data;
}
