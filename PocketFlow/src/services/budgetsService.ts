// src/services/budgetsService.ts
import { apiRequest } from './api';
import { Budget, Category } from '../types';

// ─── Budgets ──────────────────────────────────────────────────
interface BudgetWithCategory extends Budget {
  category: Category;
}

export async function getBudgets(month?: string): Promise<BudgetWithCategory[]> {
  const query = month ? `?month=${month}` : '';
  const res = await apiRequest<{ success: boolean; data: BudgetWithCategory[] }>(
    `/budgets${query}`
  );
  return res.data;
}

export async function upsertBudget(payload: {
  category_id: string;
  limit_amount: number;
  month: string;
}): Promise<void> {
  await apiRequest('/budgets', { method: 'POST', body: payload });
}

export async function deleteBudget(id: string): Promise<void> {
  await apiRequest(`/budgets/${id}`, { method: 'DELETE' });
}

// ─── Categories ───────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const res = await apiRequest<{ success: boolean; data: Category[] }>('/categories');
  return res.data;
}
