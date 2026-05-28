// src/services/accountsService.ts
import { apiRequest } from './api';
import { Account } from '../types';

interface AccountsResponse {
  success: boolean;
  data: Account[];
}

export async function getAccounts(): Promise<Account[]> {
  const res = await apiRequest<AccountsResponse>('/accounts');
  return res.data;
}

export async function createAccount(payload: {
  name: string;
  balance?: number;
  type: 'cash' | 'bank' | 'ewallet';
  currency?: string;
}): Promise<Account> {
  const res = await apiRequest<{ success: boolean; data: Account }>('/accounts', {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function updateAccount(
  id: string,
  payload: Partial<{ name: string; type: string; currency: string }>
): Promise<Account> {
  const res = await apiRequest<{ success: boolean; data: Account }>(`/accounts/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return res.data;
}
